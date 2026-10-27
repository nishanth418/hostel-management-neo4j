/**
 * SQL-to-Cypher Translation Engine
 * 
 * Uses node-sql-parser to build an AST from standard SQL and converts it to
 * clean, parameterized, production-ready Cypher for Neo4j AuraDB.
 */

const { Parser } = require('node-sql-parser');
const {
  ENTITIES,
  resolveEntityName,
  resolveAuxTable,
  resolvePropertyName,
  findRelationship
} = require('./schema');

const parser = new Parser();

// SQL dialect options
const PARSER_OPT = {
  database: 'MySQL'
};

class SqlParsingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SqlParsingError';
    this.errorType = 'SQL_PARSING_ERROR';
  }
}

class UnsupportedSqlFeatureError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnsupportedSqlFeatureError';
    this.errorType = 'UNSUPPORTED_SQL_FEATURE';
  }
}

class TranslationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TranslationError';
    this.errorType = 'TRANSLATION_ERROR';
  }
}

class TranslationContext {
  constructor() {
    this.params = {};
    this.paramIndex = 0;
    this.tableAliases = {}; // alias -> { entityName, label, isAux, auxConfig }
    this.defaultAlias = null;
    this.warnings = [];
  }

  addParam(val) {
    this.paramIndex++;
    const key = `p${this.paramIndex}`;
    this.params[key] = val;
    return `$${key}`;
  }

  registerTable(rawTable, rawAlias) {
    const aux = resolveAuxTable(rawTable);
    if (aux) {
      const parentEntity = resolveEntityName(aux.parent);
      const alias = rawAlias || rawTable.toLowerCase();
      this.tableAliases[alias] = {
        entityName: parentEntity,
        label: ENTITIES[parentEntity].label,
        isAux: true,
        auxConfig: aux,
        alias
      };
      if (!this.defaultAlias) this.defaultAlias = alias;
      return this.tableAliases[alias];
    }

    const entityName = resolveEntityName(rawTable);
    if (!entityName || !ENTITIES[entityName]) {
      throw new TranslationError(`Unknown table "${rawTable}". Valid tables: ${Object.keys(ENTITIES).join(', ')}, or auxiliary phone tables.`);
    }

    const entity = ENTITIES[entityName];
    const alias = rawAlias || entity.defaultAlias;
    this.tableAliases[alias] = {
      entityName,
      label: entity.label,
      isAux: false,
      alias
    };
    if (!this.defaultAlias) this.defaultAlias = alias;
    return this.tableAliases[alias];
  }

  resolveColumn(colRef) {
    const rawTable = colRef.table;
    const rawCol = colRef.column;

    if (rawTable) {
      const info = this.tableAliases[rawTable];
      if (info) {
        if (info.isAux) {
          if (rawCol.toLowerCase() === info.auxConfig.key.toLowerCase() || rawCol.toLowerCase() === info.auxConfig.colKey.toLowerCase()) {
            return `${info.alias}.${info.auxConfig.key}`;
          }
          return 'PhoneNo';
        }
        const prop = resolvePropertyName(info.entityName, rawCol);
        return `${info.alias}.${prop}`;
      }
      // If table alias not registered directly, try by entity name
      const entName = resolveEntityName(rawTable);
      if (entName) {
        const found = Object.values(this.tableAliases).find(t => t.entityName === entName);
        if (found) {
          const prop = resolvePropertyName(entName, rawCol);
          return `${found.alias}.${prop}`;
        }
      }
      return `${rawTable}.${rawCol}`;
    }

    // Unqualified column: look in available tables
    if (this.defaultAlias) {
      const info = this.tableAliases[this.defaultAlias];
      if (info) {
        if (info.isAux) {
          if (rawCol.toLowerCase() === info.auxConfig.key.toLowerCase() || rawCol.toLowerCase() === info.auxConfig.colKey.toLowerCase()) {
            return `${info.alias}.${info.auxConfig.key}`;
          }
          return 'PhoneNo';
        }
        const prop = resolvePropertyName(info.entityName, rawCol);
        return `${info.alias}.${prop}`;
      }
    }

    return rawCol;
  }
}

/**
 * Translates a WHERE expression AST node into Cypher expression string
 */
function translateWhereExpr(expr, ctx) {
  if (!expr) return '';

  if (expr.type === 'binary_expr') {
    const op = (expr.operator || '').toUpperCase();

    // 1. IS NULL / IS NOT NULL
    if (op === 'IS') {
      if (expr.right && expr.right.type === 'null') {
        return `${translateWhereExpr(expr.left, ctx)} IS NULL`;
      }
    }
    if (op === 'IS NOT') {
      if (expr.right && expr.right.type === 'null') {
        return `${translateWhereExpr(expr.left, ctx)} IS NOT NULL`;
      }
    }

    // 2. IN / NOT IN
    if (op === 'IN' || op === 'NOT IN') {
      const leftStr = translateWhereExpr(expr.left, ctx);
      const valList = Array.isArray(expr.right.value) ? expr.right.value : [expr.right];
      const paramKeys = valList.map(item => {
        const val = extractLiteralValue(item);
        return ctx.addParam(val);
      });
      const inClause = `${leftStr} IN [${paramKeys.join(', ')}]`;
      return op === 'NOT IN' ? `NOT (${inClause})` : inClause;
    }

    // 3. BETWEEN
    if (op === 'BETWEEN' || op === 'NOT BETWEEN') {
      const leftStr = translateWhereExpr(expr.left, ctx);
      const val1 = extractLiteralValue(expr.right.value[0]);
      const val2 = extractLiteralValue(expr.right.value[1]);
      const p1 = ctx.addParam(val1);
      const p2 = ctx.addParam(val2);
      const bClause = `(${leftStr} >= ${p1} AND ${leftStr} <= ${p2})`;
      return op === 'NOT BETWEEN' ? `NOT ${bClause}` : bClause;
    }

    // 4. LIKE
    if (op === 'LIKE' || op === 'NOT LIKE') {
      const leftStr = translateWhereExpr(expr.left, ctx);
      const rawPattern = extractLiteralValue(expr.right);
      if (typeof rawPattern === 'string') {
        let likeStr = '';
        if (rawPattern.startsWith('%') && rawPattern.endsWith('%') && rawPattern.length > 2) {
          const sub = rawPattern.slice(1, -1);
          likeStr = `${leftStr} CONTAINS ${ctx.addParam(sub)}`;
        } else if (rawPattern.startsWith('%') && rawPattern.length > 1) {
          const sub = rawPattern.slice(1);
          likeStr = `${leftStr} ENDS WITH ${ctx.addParam(sub)}`;
        } else if (rawPattern.endsWith('%') && rawPattern.length > 1) {
          const sub = rawPattern.slice(0, -1);
          likeStr = `${leftStr} STARTS WITH ${ctx.addParam(sub)}`;
        } else {
          likeStr = `${leftStr} = ${ctx.addParam(rawPattern)}`;
        }
        return op === 'NOT LIKE' ? `NOT (${likeStr})` : likeStr;
      }
    }

    // 5. Standard Comparisons & Logical
    const cypherOpMap = {
      '=': '=',
      '!=': '<>',
      '<>': '<>',
      '<': '<',
      '<=': '<=',
      '>': '>',
      '>=': '>=',
      'AND': 'AND',
      'OR': 'OR'
    };

    const cOp = cypherOpMap[op] || op;
    const leftStr = translateWhereExpr(expr.left, ctx);
    const rightStr = translateWhereExpr(expr.right, ctx);
    return `(${leftStr} ${cOp} ${rightStr})`;
  }

  if (expr.type === 'unary_expr') {
    const op = (expr.operator || '').toUpperCase();
    if (op === 'NOT') {
      return `NOT (${translateWhereExpr(expr.expr, ctx)})`;
    }
    return `${op} (${translateWhereExpr(expr.expr, ctx)})`;
  }

  if (expr.type === 'column_ref') {
    return ctx.resolveColumn(expr);
  }

  if (expr.type === 'single_quote_string' || expr.type === 'string') {
    return ctx.addParam(expr.value);
  }

  if (expr.type === 'number') {
    return ctx.addParam(expr.value);
  }

  if (expr.type === 'bool') {
    return expr.value ? 'true' : 'false';
  }

  if (expr.type === 'null') {
    return 'null';
  }

  if (expr.type === 'function' || expr.type === 'aggr_func') {
    return translateFunctionCall(expr, ctx);
  }

  return '';
}

/**
 * Extracts a JS primitive from a literal AST node
 */
function extractLiteralValue(node) {
  if (!node) return null;
  if (node.value !== undefined) return node.value;
  return null;
}

/**
 * Translates SQL functions (COUNT, SUM, AVG, MIN, MAX, ROUND, etc.) to Cypher
 */
function translateFunctionCall(funcNode, ctx) {
  const name = (funcNode.name || '').toUpperCase();
  const funcMap = {
    'COUNT': 'count',
    'SUM': 'sum',
    'AVG': 'avg',
    'MIN': 'min',
    'MAX': 'max',
    'ROUND': 'round',
    'COALESCE': 'coalesce',
    'LOWER': 'toLower',
    'UPPER': 'toUpper',
    'LENGTH': 'size'
  };

  const cypherFunc = funcMap[name] || name.toLowerCase();

  const argsNode = funcNode.args;
  if (!argsNode) {
    if (name === 'COUNT') return 'count(*)';
    return `${cypherFunc}()`;
  }

  // Determine distinct prefix
  const distinctPrefix = (argsNode.distinct && typeof argsNode.distinct === 'string') ? 'DISTINCT ' : '';

  // Extract argument items: can be argsNode.expr (e.g. aggr_func) or argsNode.value (e.g. expr_list)
  let argsList = [];
  if (argsNode.expr) {
    argsList = [argsNode.expr];
  } else if (argsNode.value) {
    argsList = Array.isArray(argsNode.value) ? argsNode.value : [argsNode.value];
  } else if (Array.isArray(argsNode)) {
    argsList = argsNode;
  }

  if (argsList.length === 0) {
    if (name === 'COUNT') return 'count(*)';
    return `${cypherFunc}()`;
  }

  const translatedArgs = argsList.map(a => {
    if (!a) return '';
    if (a.type === 'star' || a.column === '*' || a.value === '*') return '*';
    if (a.type === 'column_ref') return ctx.resolveColumn(a);
    if (a.type === 'number' || a.type === 'single_quote_string' || a.type === 'string') {
      return ctx.addParam(extractLiteralValue(a));
    }
    if (a.type === 'function' || a.type === 'aggr_func') {
      return translateFunctionCall(a, ctx);
    }
    return translateWhereExpr(a, ctx);
  });

  return `${cypherFunc}(${distinctPrefix}${translatedArgs.join(', ')})`;
}

/**
 * Translates a SELECT query
 */
function translateSelect(ast, ctx) {
  const fromList = ast.from;
  if (!fromList || !Array.isArray(fromList) || fromList.length === 0) {
    throw new TranslationError('SELECT statement must include a FROM table clause.');
  }

  // 1. Process primary table
  const primaryTableItem = fromList[0];
  const rawPrimaryTable = primaryTableItem.table;
  const rawPrimaryAlias = primaryTableItem.as;

  const primaryInfo = ctx.registerTable(rawPrimaryTable, rawPrimaryAlias);

  const matchClauses = [];

  if (primaryInfo.isAux) {
    // Phone auxiliary table unwind pattern
    const phoneField = primaryInfo.auxConfig.phoneProp || primaryInfo.auxConfig.arrayField || 'phones';
    matchClauses.push(`MATCH (${primaryInfo.alias}:${primaryInfo.label})`);
    matchClauses.push(`UNWIND ${primaryInfo.alias}.${phoneField} AS PhoneNo`);
  } else {
    matchClauses.push(`MATCH (${primaryInfo.alias}:${primaryInfo.label})`);
  }

  // 2. Process joins (INNER JOIN, LEFT JOIN)
  for (let i = 1; i < fromList.length; i++) {
    const joinItem = fromList[i];
    const rawJoinTable = joinItem.table;
    const rawJoinAlias = joinItem.as;
    const joinType = (joinItem.join || 'INNER JOIN').toUpperCase();

    const joinInfo = ctx.registerTable(rawJoinTable, rawJoinAlias);
    const isLeftJoin = joinType.includes('LEFT');
    const matchKeyword = isLeftJoin ? 'OPTIONAL MATCH' : 'MATCH';

    // Attempt to resolve relationship from verified graph schema
    let relUsed = null;
    let leftInfo = primaryInfo;
    let rightInfo = joinInfo;

    if (joinItem.on && joinItem.on.type === 'binary_expr' && joinItem.on.operator === '=') {
      const leftCol = joinItem.on.left;
      const rightCol = joinItem.on.right;

      if (leftCol.type === 'column_ref' && rightCol.type === 'column_ref') {
        leftInfo = ctx.tableAliases[leftCol.table] || primaryInfo;
        rightInfo = ctx.tableAliases[rightCol.table] || joinInfo;

        const rel = findRelationship(
          leftInfo.entityName,
          rightInfo.entityName,
          leftCol.column,
          rightCol.column
        );

        if (rel) {
          relUsed = rel;
        }
      }
    }

    if (relUsed) {
      const fromAlias = relUsed.from === leftInfo.entityName ? leftInfo.alias : rightInfo.alias;
      const toAlias = relUsed.to === rightInfo.entityName ? rightInfo.alias : leftInfo.alias;
      const newAlias = joinInfo.alias;
      const newLabel = joinInfo.label;

      if (toAlias === newAlias) {
        matchClauses.push(`${matchKeyword} (${fromAlias})-[:${relUsed.type}]->(${toAlias}:${newLabel})`);
      } else {
        matchClauses.push(`${matchKeyword} (${newAlias}:${newLabel})-[:${relUsed.type}]->(${toAlias})`);
      }
    } else {
      // General match with join condition in WHERE
      if (joinItem.on) {
        const onCondition = translateWhereExpr(joinItem.on, ctx);
        matchClauses.push(`${matchKeyword} (${joinInfo.alias}:${joinInfo.label}) WHERE ${onCondition}`);
      } else {
        matchClauses.push(`${matchKeyword} (${joinInfo.alias}:${joinInfo.label})`);
      }
    }
  }

  let cypher = matchClauses.join('\n');

  // 3. WHERE clause
  if (ast.where) {
    const whereCondition = translateWhereExpr(ast.where, ctx);
    if (whereCondition) {
      cypher += `\nWHERE ${whereCondition}`;
    }
  }

  // 4. Columns & RETURN projections
  const colList = ast.columns;
  let returnItems = [];
  const isStar = !colList || colList === '*' || (Array.isArray(colList) && colList.some(c => (c.expr && c.expr.type === 'star') || (c.expr && c.expr.column === '*')));

  if (isStar) {
    if (primaryInfo.isAux) {
      returnItems.push(`${primaryInfo.alias}.${primaryInfo.auxConfig.key} AS ${primaryInfo.auxConfig.colKey}, PhoneNo`);
    } else if (fromList.length === 1) {
      returnItems.push(primaryInfo.alias);
    } else {
      returnItems = Object.keys(ctx.tableAliases);
    }
  } else {
    for (const c of colList) {
      if (c.expr && (c.expr.type === 'star' || c.expr.column === '*')) {
        const targetTable = c.expr.table ? (ctx.tableAliases[c.expr.table]?.alias || c.expr.table) : primaryInfo.alias;
        returnItems.push(targetTable);
        continue;
      }

      let exprStr = '';
      if (c.expr.type === 'column_ref') {
        exprStr = ctx.resolveColumn(c.expr);
      } else if (c.expr.type === 'function' || c.expr.type === 'aggr_func') {
        exprStr = translateFunctionCall(c.expr, ctx);
      } else {
        exprStr = translateWhereExpr(c.expr, ctx);
      }

      if (c.as) {
        returnItems.push(`${exprStr} AS ${c.as}`);
      } else if (c.expr.type === 'column_ref') {
        returnItems.push(`${exprStr} AS ${c.expr.column}`);
      } else {
        returnItems.push(exprStr);
      }
    }
  }

  const distinctStr = ast.distinct ? 'DISTINCT ' : '';
  cypher += `\nRETURN ${distinctStr}${returnItems.join(', ')}`;

  // 5. HAVING clause
  if (ast.having) {
    const havingCond = translateWhereExpr(ast.having, ctx);
    if (havingCond) {
      // Cypher HAVING pattern: WITH returnItems WHERE havingCond RETURN returnAliases
      const returnAliases = returnItems.map(item => {
        const asMatch = item.match(/\s+AS\s+([A-Za-z0-9_]+)$/i);
        return asMatch ? asMatch[1] : item;
      });
      cypher = cypher.replace(/\nRETURN (DISTINCT )?/, '\nWITH $1');
      cypher += `\nWHERE ${havingCond}\nRETURN ${returnAliases.join(', ')}`;
    }
  }

  // 6. ORDER BY
  if (ast.orderby && Array.isArray(ast.orderby) && ast.orderby.length > 0) {
    const orderItems = ast.orderby.map(o => {
      let colStr = '';
      if (o.expr.type === 'column_ref') {
        colStr = ctx.resolveColumn(o.expr);
      } else {
        colStr = translateWhereExpr(o.expr, ctx);
      }
      const dir = (o.type || 'ASC').toUpperCase();
      return `${colStr} ${dir}`;
    });
    cypher += `\nORDER BY ${orderItems.join(', ')}`;
  }

  // 7. LIMIT & OFFSET
  if (ast.limit) {
    const limitObj = ast.limit;
    if (Array.isArray(limitObj.value)) {
      if (limitObj.value.length === 2) {
        // LIMIT offset, count
        const offsetVal = limitObj.value[0].value;
        const countVal = limitObj.value[1].value;
        cypher += `\nSKIP ${offsetVal}\nLIMIT ${countVal}`;
      } else if (limitObj.value.length === 1) {
        cypher += `\nLIMIT ${limitObj.value[0].value}`;
      }
    } else if (limitObj.value !== undefined) {
      cypher += `\nLIMIT ${limitObj.value}`;
    }
  } else {
    // Sensible default limit to safeguard performance if query doesn't specify one
    if (!isStar && returnItems.some(item => item.includes('count(') || item.includes('sum('))) {
      // Aggregation queries don't need arbitrary default limit
    } else {
      cypher += `\nLIMIT 500`;
    }
  }

  return {
    cypher,
    params: ctx.params,
    type: 'READ'
  };
}

/**
 * Translates an INSERT INTO query
 */
function translateInsert(ast, ctx) {
  const tableNode = ast.table;
  const rawTable = Array.isArray(tableNode) ? tableNode[0].table : (tableNode.table || tableNode);
  const entityName = resolveEntityName(rawTable);

  if (!entityName || !ENTITIES[entityName]) {
    throw new TranslationError(`Cannot insert into unknown table "${rawTable}".`);
  }

  const entity = ENTITIES[entityName];
  const alias = entity.defaultAlias;
  const columns = ast.columns || [];
  let valuesList = [];
  if (Array.isArray(ast.values)) {
    valuesList = ast.values;
  } else if (ast.values && Array.isArray(ast.values.values)) {
    valuesList = ast.values.values;
  } else if (ast.values && ast.values.value) {
    valuesList = [ast.values];
  }

  if (!valuesList || valuesList.length === 0) {
    throw new TranslationError('INSERT statement contains no VALUES.');
  }

  const rowValues = valuesList[0].value;
  const propAssignments = [];

  for (let i = 0; i < columns.length; i++) {
    const rawCol = columns[i];
    const valNode = rowValues[i];
    const propName = resolvePropertyName(entityName, rawCol);
    const val = extractLiteralValue(valNode);
    const paramKey = ctx.addParam(val);
    propAssignments.push(`${propName}: ${paramKey}`);
  }

  const propsStr = propAssignments.join(', ');
  const cypher = `CREATE (${alias}:${entity.label} { ${propsStr} })\nRETURN ${alias}`;

  return {
    cypher,
    params: ctx.params,
    type: 'WRITE',
    affectedEntity: entityName
  };
}

/**
 * Translates an UPDATE ... SET ... WHERE query
 */
function translateUpdate(ast, ctx) {
  const tableNode = ast.table;
  const rawTable = Array.isArray(tableNode) ? tableNode[0].table : (tableNode.table || tableNode);
  const entityName = resolveEntityName(rawTable);

  if (!entityName || !ENTITIES[entityName]) {
    throw new TranslationError(`Cannot update unknown table "${rawTable}".`);
  }

  const entity = ENTITIES[entityName];
  const alias = entity.defaultAlias;
  ctx.registerTable(rawTable, alias);

  const setList = ast.set || [];
  if (!Array.isArray(setList) || setList.length === 0) {
    throw new TranslationError('UPDATE statement missing SET assignments.');
  }

  const setAssignments = [];
  for (const item of setList) {
    const rawCol = item.column;
    const propName = resolvePropertyName(entityName, rawCol);
    let valStr = '';

    if (item.value.type === 'column_ref') {
      valStr = ctx.resolveColumn(item.value);
    } else {
      const val = extractLiteralValue(item.value);
      valStr = ctx.addParam(val);
    }

    setAssignments.push(`${alias}.${propName} = ${valStr}`);
  }

  let cypher = `MATCH (${alias}:${entity.label})`;

  if (ast.where) {
    const whereCondition = translateWhereExpr(ast.where, ctx);
    cypher += `\nWHERE ${whereCondition}`;
  }

  cypher += `\nSET ${setAssignments.join(', ')}\nRETURN ${alias}`;

  return {
    cypher,
    params: ctx.params,
    type: 'WRITE',
    affectedEntity: entityName
  };
}

/**
 * Translates a DELETE FROM ... WHERE query
 */
function translateDelete(ast, ctx) {
  const fromList = ast.from;
  if (!fromList || !Array.isArray(fromList) || fromList.length === 0) {
    throw new TranslationError('DELETE statement missing FROM table.');
  }

  const fromItem = fromList[0];
  const entityName = resolveEntityName(fromItem.table);
  if (!entityName || !ENTITIES[entityName]) {
    throw new TranslationError(`Cannot delete from unknown table "${fromItem.table}".`);
  }

  const entity = ENTITIES[entityName];
  const alias = entity.defaultAlias;
  ctx.registerTable(fromItem.table, alias);

  if (!ast.where) {
    throw new UnsupportedSqlFeatureError('DELETE without WHERE clause is blocked for safety. Please provide a specific WHERE condition (e.g. WHERE studentId = \'...\').');
  }

  const whereCondition = translateWhereExpr(ast.where, ctx);
  // Use DETACH DELETE to safely remove node and its incident relationships
  const cypher = `MATCH (${alias}:${entity.label})\nWHERE ${whereCondition}\nDETACH DELETE ${alias}`;

  return {
    cypher,
    params: ctx.params,
    type: 'WRITE',
    affectedEntity: entityName
  };
}

/**
 * Normalizes uppercase SQL tables if user directly enters Cypher query with SQL table names
 * e.g. MATCH (s:STUDENT) -> MATCH (s:Student)
 */
function normalizeCypherQuery(rawCypher) {
  let normalized = rawCypher;
  for (const [key, ent] of Object.entries(ENTITIES)) {
    const regexUpper = new RegExp(`(:\\s*)${key.toUpperCase()}(\\b)`, 'g');
    normalized = normalized.replace(regexUpper, `$1${ent.label}$2`);
  }
  return normalized;
}

/**
 * Main translation entrypoint
 */
function translateSqlToCypher(rawSql) {
  if (!rawSql || typeof rawSql !== 'string' || !rawSql.trim()) {
    throw new TranslationError('SQL query cannot be empty.');
  }

  const trimmed = rawSql.trim().replace(/;+\s*$/, '');

  // 1. Check if user entered native Cypher directly
  if (/^\s*(MATCH|OPTIONAL\s+MATCH|MERGE|CALL|SHOW|PROFILE|EXPLAIN)\b/i.test(trimmed)) {
    return {
      cypher: normalizeCypherQuery(trimmed),
      params: {},
      type: /\b(DELETE|DETACH|CREATE|MERGE|SET|REMOVE)\b/i.test(trimmed) ? 'WRITE' : 'READ',
      isNativeCypher: true
    };
  }

  // 2. Parse SQL to AST using node-sql-parser
  let ast;
  try {
    ast = parser.astify(trimmed, PARSER_OPT);
  } catch (parseErr) {
    throw new SqlParsingError(`SQL Syntax Error: ${parseErr.message || 'Unable to parse SQL query.'}`);
  }

  const rootAst = Array.isArray(ast) ? ast[0] : ast;
  if (!rootAst || !rootAst.type) {
    throw new SqlParsingError('Unsupported or malformed SQL statement.');
  }

  const ctx = new TranslationContext();
  const statementType = (rootAst.type || '').toLowerCase();

  switch (statementType) {
    case 'select':
      return translateSelect(rootAst, ctx);
    case 'insert':
      return translateInsert(rootAst, ctx);
    case 'update':
      return translateUpdate(rootAst, ctx);
    case 'delete':
      return translateDelete(rootAst, ctx);
    case 'create':
    case 'alter':
    case 'drop':
      throw new UnsupportedSqlFeatureError(`Schema operation (${statementType.toUpperCase()}) is not supported in interactive SQL Studio. Node constraints and schema are managed via database/schema.cypher.`);
    default:
      throw new UnsupportedSqlFeatureError(`SQL statement type "${statementType.toUpperCase()}" is not supported. Supported: SELECT, INSERT, UPDATE, DELETE.`);
  }
}

module.exports = {
  translateSqlToCypher,
  normalizeCypherQuery,
  SqlParsingError,
  UnsupportedSqlFeatureError,
  TranslationError
};
