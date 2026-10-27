const express = require('express');
const router = express.Router();
const { query, execute } = require('../database');
const { translateSqlToCypher, ENTITIES } = require('../sql-to-cypher');

const REQUIRED_TABLES = [
  'WARDEN',
  'WARDEN_PHONE',
  'HOSTEL',
  'ROOM_TYPE',
  'ROOM',
  'STUDENT',
  'STUDENT_PHONE',
  'MESS',
  'MESS_CONTACT',
  'MEAL',
  'STAFF',
  'STAFF_PHONE',
  'SUPPLIER',
  'SUPPLIER_PHONE',
  'INVENTORY_ITEM',
  'PROCURES',
  'PAYMENT',
  'PAYMENT_DETAIL'
];

const TABLE_SCHEMAS = {
  WARDEN: [
    { cid: 1, name: 'WardenID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'WardenName', type: 'VARCHAR(100)', notnull: true, pk: false },
    { cid: 3, name: 'Email', type: 'VARCHAR(100)', notnull: false, pk: false },
    { cid: 4, name: 'JoiningDate', type: 'VARCHAR(30)', notnull: false, pk: false }
  ],
  WARDEN_PHONE: [
    { cid: 1, name: 'WardenID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'PhoneNo', type: 'VARCHAR(20)', notnull: true, pk: true }
  ],
  HOSTEL: [
    { cid: 1, name: 'HostelID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'HostelName', type: 'VARCHAR(100)', notnull: true, pk: false },
    { cid: 3, name: 'TotalFloors', type: 'INT', notnull: false, pk: false },
    { cid: 4, name: 'WardenID', type: 'VARCHAR(20)', notnull: false, pk: false }
  ],
  ROOM_TYPE: [
    { cid: 1, name: 'TypeID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'TypeName', type: 'VARCHAR(50)', notnull: true, pk: false },
    { cid: 3, name: 'AC_Type', type: 'VARCHAR(20)', notnull: false, pk: false },
    { cid: 4, name: 'Capacity', type: 'INT', notnull: false, pk: false }
  ],
  ROOM: [
    { cid: 1, name: 'RoomNo', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'FloorNo', type: 'INT', notnull: false, pk: false },
    { cid: 3, name: 'Type', type: 'VARCHAR(50)', notnull: false, pk: false },
    { cid: 4, name: 'Capacity', type: 'INT', notnull: false, pk: false },
    { cid: 5, name: 'RoomRent', type: 'INT', notnull: false, pk: false },
    { cid: 6, name: 'HostelID', type: 'VARCHAR(20)', notnull: false, pk: false }
  ],
  STUDENT: [
    { cid: 1, name: 'StudentID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'FirstName', type: 'VARCHAR(50)', notnull: true, pk: false },
    { cid: 3, name: 'LastName', type: 'VARCHAR(50)', notnull: false, pk: false },
    { cid: 4, name: 'Gender', type: 'VARCHAR(15)', notnull: false, pk: false },
    { cid: 5, name: 'DOB', type: 'VARCHAR(30)', notnull: false, pk: false },
    { cid: 6, name: 'Email', type: 'VARCHAR(100)', notnull: false, pk: false },
    { cid: 7, name: 'BloodGroup', type: 'VARCHAR(10)', notnull: false, pk: false },
    { cid: 8, name: 'AllergyInfo', type: 'VARCHAR(150)', notnull: false, pk: false },
    { cid: 9, name: 'PlanType', type: 'VARCHAR(50)', notnull: false, pk: false },
    { cid: 10, name: 'RoomNo', type: 'VARCHAR(20)', notnull: false, pk: false },
    { cid: 11, name: 'HostelID', type: 'VARCHAR(20)', notnull: false, pk: false },
    { cid: 12, name: 'MessID', type: 'VARCHAR(20)', notnull: false, pk: false },
    { cid: 13, name: 'MentorStudentID', type: 'VARCHAR(20)', notnull: false, pk: false }
  ],
  STUDENT_PHONE: [
    { cid: 1, name: 'StudentID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'PhoneNo', type: 'VARCHAR(20)', notnull: true, pk: true }
  ],
  MESS: [
    { cid: 1, name: 'MessID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'MessName', type: 'VARCHAR(100)', notnull: true, pk: false },
    { cid: 3, name: 'MessType', type: 'VARCHAR(50)', notnull: false, pk: false },
    { cid: 4, name: 'Location', type: 'VARCHAR(100)', notnull: false, pk: false }
  ],
  MESS_CONTACT: [
    { cid: 1, name: 'MessID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'ContactNo', type: 'VARCHAR(20)', notnull: true, pk: true }
  ],
  MEAL: [
    { cid: 1, name: 'MealID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'MealName', type: 'VARCHAR(100)', notnull: true, pk: false },
    { cid: 3, name: 'Description', type: 'VARCHAR(255)', notnull: false, pk: false },
    { cid: 4, name: 'Cost', type: 'INT', notnull: false, pk: false },
    { cid: 5, name: 'MessID', type: 'VARCHAR(20)', notnull: false, pk: false }
  ],
  STAFF: [
    { cid: 1, name: 'StaffID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'StaffName', type: 'VARCHAR(100)', notnull: true, pk: false },
    { cid: 3, name: 'JoinDate', type: 'VARCHAR(30)', notnull: false, pk: false },
    { cid: 4, name: 'Salary', type: 'INT', notnull: false, pk: false },
    { cid: 5, name: 'Role', type: 'VARCHAR(50)', notnull: false, pk: false },
    { cid: 6, name: 'MessID', type: 'VARCHAR(20)', notnull: false, pk: false }
  ],
  STAFF_PHONE: [
    { cid: 1, name: 'StaffID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'PhoneNo', type: 'VARCHAR(20)', notnull: true, pk: true }
  ],
  SUPPLIER: [
    { cid: 1, name: 'SupplierID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'SupplierName', type: 'VARCHAR(100)', notnull: true, pk: false }
  ],
  SUPPLIER_PHONE: [
    { cid: 1, name: 'SupplierID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'PhoneNo', type: 'VARCHAR(20)', notnull: true, pk: true }
  ],
  INVENTORY_ITEM: [
    { cid: 1, name: 'ItemID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'ItemName', type: 'VARCHAR(100)', notnull: true, pk: false },
    { cid: 3, name: 'Category', type: 'VARCHAR(50)', notnull: false, pk: false },
    { cid: 4, name: 'Unit', type: 'VARCHAR(20)', notnull: false, pk: false }
  ],
  PROCURES: [
    { cid: 1, name: 'MessID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'SupplierID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 3, name: 'ItemID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 4, name: 'Quantity', type: 'INT', notnull: false, pk: false }
  ],
  PAYMENT: [
    { cid: 1, name: 'PaymentID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'StudentID', type: 'VARCHAR(20)', notnull: true, pk: false },
    { cid: 3, name: 'Amount', type: 'INT', notnull: false, pk: false },
    { cid: 4, name: 'PaymentMode', type: 'VARCHAR(50)', notnull: false, pk: false },
    { cid: 5, name: 'Status', type: 'VARCHAR(30)', notnull: false, pk: false },
    { cid: 6, name: 'PaymentDay', type: 'INT', notnull: false, pk: false },
    { cid: 7, name: 'PaymentMonth', type: 'INT', notnull: false, pk: false },
    { cid: 8, name: 'PaymentYear', type: 'INT', notnull: false, pk: false }
  ],
  PAYMENT_DETAIL: [
    { cid: 1, name: 'PaymentID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'DetailID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 3, name: 'Month', type: 'VARCHAR(30)', notnull: false, pk: false },
    { cid: 4, name: 'Year', type: 'INT', notnull: false, pk: false },
    { cid: 5, name: 'MessCharges', type: 'INT', notnull: false, pk: false },
    { cid: 6, name: 'OtherCharges', type: 'INT', notnull: false, pk: false }
  ]
};

const NODE_LABELS = [
  { label: 'Student', primaryKey: 'studentId', properties: ['studentId', 'firstName', 'lastName', 'gender', 'dob', 'email', 'bloodGroup', 'allergyInfo', 'planType', 'phones', 'roomNo', 'hostelId', 'messId', 'mentorStudentId'] },
  { label: 'Hostel', primaryKey: 'hostelId', properties: ['hostelId', 'name', 'totalFloors', 'wardenId'] },
  { label: 'Room', primaryKey: 'roomNo', properties: ['roomNo', 'floorNo', 'type', 'capacity', 'roomRent', 'hostelId'] },
  { label: 'RoomType', primaryKey: 'typeId', properties: ['typeId', 'typeName', 'acType', 'capacity'] },
  { label: 'Warden', primaryKey: 'wardenId', properties: ['wardenId', 'name', 'email', 'joiningDate', 'phones'] },
  { label: 'Mess', primaryKey: 'messId', properties: ['messId', 'name', 'messType', 'location', 'contacts'] },
  { label: 'Meal', primaryKey: 'mealId', properties: ['mealId', 'name', 'description', 'cost', 'messId'] },
  { label: 'Staff', primaryKey: 'staffId', properties: ['staffId', 'name', 'joinDate', 'salary', 'role', 'messId', 'phones'] },
  { label: 'Supplier', primaryKey: 'supplierId', properties: ['supplierId', 'name', 'phones'] },
  { label: 'InventoryItem', primaryKey: 'itemId', properties: ['itemId', 'name', 'category', 'unit'] },
  { label: 'Procurement', primaryKey: 'procureId', properties: ['procureId', 'quantity', 'messId', 'supplierId', 'itemId'] },
  { label: 'Payment', primaryKey: 'paymentId', properties: ['paymentId', 'studentId', 'amount', 'paymentMode', 'status', 'paymentDay', 'paymentMonth', 'paymentYear'] },
  { label: 'PaymentDetail', primaryKey: 'id', properties: ['id', 'paymentId', 'detailId', 'month', 'year', 'messCharges', 'otherCharges'] }
];

const RELATIONSHIPS = [
  { type: 'MANAGED_BY', source: 'Hostel', target: 'Warden', desc: 'Hostel supervised by presiding warden' },
  { type: 'LOCATED_IN', source: 'Room', target: 'Hostel', desc: 'Physical room situated inside hostel' },
  { type: 'OF_TYPE', source: 'Room', target: 'RoomType', desc: 'Room categorized by type & amenities' },
  { type: 'ALLOCATED_TO', source: 'Student', target: 'Room', desc: 'Student assigned to bed/room' },
  { type: 'RESIDES_IN', source: 'Student', target: 'Hostel', desc: 'Student assigned to hostel building' },
  { type: 'ENROLLED_IN', source: 'Student', target: 'Mess', desc: 'Student dining subscription' },
  { type: 'MENTORED_BY', source: 'Student', target: 'Student', desc: 'Junior resident advised by senior mentor' },
  { type: 'SERVED_IN', source: 'Meal', target: 'Mess', desc: 'Meal served at dining facility' },
  { type: 'ASSIGNED_TO', source: 'Staff', target: 'Mess', desc: 'Workforce assigned to mess' },
  { type: 'PLACED_ORDER', source: 'Mess', target: 'Procurement', desc: 'Mess procuring stock items' },
  { type: 'SUPPLIED_BY', source: 'Procurement', target: 'Supplier', desc: 'Vendor fulfilling procurement order' },
  { type: 'INCLUDES_ITEM', source: 'Procurement', target: 'InventoryItem', desc: 'Provision item being supplied' },
  { type: 'PAID_BY', source: 'Payment', target: 'Student', desc: 'Student responsible for payment' },
  { type: 'HAS_DETAIL', source: 'Payment', target: 'PaymentDetail', desc: 'Detailed billing breakdown' }
];

const TABLE_TO_LABEL_MAP = {
  STUDENT: { label: 'Student', alias: 's' },
  HOSTEL: { label: 'Hostel', alias: 'h' },
  ROOM_TYPE: { label: 'RoomType', alias: 'rt' },
  ROOM: { label: 'Room', alias: 'r' },
  WARDEN: { label: 'Warden', alias: 'w' },
  MESS: { label: 'Mess', alias: 'm' },
  MEAL: { label: 'Meal', alias: 'ml' },
  STAFF: { label: 'Staff', alias: 'st' },
  SUPPLIER: { label: 'Supplier', alias: 'sup' },
  INVENTORY_ITEM: { label: 'InventoryItem', alias: 'i' },
  PROCUREMENT: { label: 'Procurement', alias: 'p' },
  PROCURES: { label: 'Procurement', alias: 'p' },
  PAYMENT: { label: 'Payment', alias: 'pay' },
  PAYMENT_DETAIL: { label: 'PaymentDetail', alias: 'pd' },
  STUDENT_PHONE: { label: 'Student', alias: 's' },
  WARDEN_PHONE: { label: 'Warden', alias: 'w' },
  STAFF_PHONE: { label: 'Staff', alias: 'st' },
  SUPPLIER_PHONE: { label: 'Supplier', alias: 'sup' },
  MESS_CONTACT: { label: 'Mess', alias: 'm' }
};

function stripComments(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\r\n]*/g, '')
    .replace(/#[^\r\n]*/g, '')
    .trim();
}

/**
 * Translates MySQL-style SQL queries (e.g. SELECT * FROM STUDENT) to Cypher (MATCH (s:Student) RETURN s),
 * and normalizes uppercase MySQL table names in Cypher queries to proper Neo4j labels.
 */
function translateSqlOrNormalizeCypher(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') return rawQuery;
  const stripped = stripComments(rawQuery);
  const trimmed = stripped.trim().replace(/;+\s*$/, '');

  // 1. Check if query is SQL SELECT
  const selectRegex = /^\s*SELECT\s+([\s\S]+?)\s+FROM\s+([A-Za-z0-9_]+)(?:\s+WHERE\s+([\s\S]+?))?(?:\s+ORDER\s+BY\s+([\s\S]+?))?(?:\s+LIMIT\s+(\d+))?\s*$/i;
  const match = trimmed.match(selectRegex);

  if (match) {
    const rawCols = match[1].trim();
    const rawTable = match[2].trim().toUpperCase();
    const rawWhere = match[3] ? match[3].trim() : null;
    const rawOrderBy = match[4] ? match[4].trim() : null;
    const rawLimit = match[5] ? match[5].trim() : null;

    const mapping = TABLE_TO_LABEL_MAP[rawTable] || {
      label: rawTable.charAt(0).toUpperCase() + rawTable.slice(1).toLowerCase(),
      alias: rawTable.charAt(0).toLowerCase()
    };
    const { label, alias } = mapping;

    let cypher = `MATCH (${alias}:${label})`;

    if (rawWhere) {
      let whereClause = rawWhere.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\s*(=|!=|<>|<|>|<=|>=|LIKE|IN)\b/gi, (m, col, op) => {
        if (col.toLowerCase() === alias.toLowerCase() || col.includes('.')) return m;
        return `${alias}.${col} ${op}`;
      });
      cypher += ` WHERE ${whereClause}`;
    }

    if (rawCols === '*') {
      cypher += ` RETURN ${alias}`;
    } else {
      const cols = rawCols.split(',').map(c => c.trim()).map(c => {
        if (c.toLowerCase().startsWith(alias.toLowerCase() + '.') || c.includes('(')) return c;
        return `${alias}.${c}`;
      }).join(', ');
      cypher += ` RETURN ${cols}`;
    }

    if (rawOrderBy) {
      let orderClause = rawOrderBy.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (col) => {
        if (['ASC', 'DESC'].includes(col.toUpperCase()) || col.includes('.')) return col;
        return `${alias}.${col}`;
      });
      cypher += ` ORDER BY ${orderClause}`;
    }

    if (rawLimit) {
      cypher += ` LIMIT ${rawLimit}`;
    }

    return cypher;
  }

  // 2. Normalize uppercase table names in Cypher queries: e.g. (:STUDENT) -> (:Student)
  let normalized = trimmed;
  for (const [table, { label }] of Object.entries(TABLE_TO_LABEL_MAP)) {
    const labelRegex = new RegExp(`(:\\s*)${table}(\\b)`, 'gi');
    normalized = normalized.replace(labelRegex, `$1${label}$2`);
  }

  return normalized;
}

function unwrapRecords(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { rows: [], columns: [] };
  }

  const firstRow = rows[0];
  const keys = Object.keys(firstRow);

  // If a single column was returned and its value in all rows is an object/Node
  if (keys.length === 1) {
    const colKey = keys[0];
    const isSingleObjectCol = rows.every(
      r => r && typeof r[colKey] === 'object' && r[colKey] !== null && !Array.isArray(r[colKey])
    );

    if (isSingleObjectCol) {
      const propKeys = [];
      rows.forEach(r => {
        const obj = r[colKey] || {};
        Object.keys(obj).forEach(pk => {
          if (!pk.startsWith('__') && !pk.startsWith('_') && !propKeys.includes(pk)) {
            propKeys.push(pk);
          }
        });
      });

      const unwrappedRows = rows.map(r => {
        const obj = r[colKey] || {};
        const unwrapped = {};
        propKeys.forEach(pk => {
          unwrapped[pk] = obj[pk] !== undefined ? obj[pk] : null;
        });
        return unwrapped;
      });

      return {
        columns: propKeys,
        rows: unwrappedRows
      };
    }
  }

  return {
    columns: keys,
    rows
  };
}

function isReadQuery(text) {
  const clean = stripComments(text);
  // Mutating Cypher keywords indicate write transaction
  if (/\b(DELETE|DETACH|CREATE|MERGE|SET|REMOVE|DROP)\b/i.test(clean)) {
    return false;
  }
  // Read and introspection operations
  if (/^\s*(MATCH|OPTIONAL\s+MATCH|RETURN|WITH|UNWIND|CALL|SHOW|EXPLAIN|PROFILE|SELECT)\b/i.test(clean)) {
    return true;
  }
  return true;
}

// POST /api/query - Execute SQL Studio queries (with SQL-to-Cypher translation)
router.post('/', async (req, res) => {
  try {
    const rawQuery = req.body.sql || req.body.query || req.body.cypher;
    if (!rawQuery || typeof rawQuery !== 'string' || !rawQuery.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Query cannot be empty.',
        message: 'Query cannot be empty.'
      });
    }

    const stripped = stripComments(rawQuery);
    const translation = translateSqlToCypher(stripped);
    const cleanQuery = translation.cypher.trim().replace(/;+$/, '');
    const params = translation.params || {};
    const queryType = translation.type || (isReadQuery(cleanQuery) ? 'READ' : 'WRITE');
    const startTime = process.hrtime();

    if (queryType === 'READ') {
      const rawRows = await query(cleanQuery, params);
      const diff = process.hrtime(startTime);
      const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

      const { columns, rows } = unwrapRecords(rawRows);

      return res.json({
        success: true,
        type: 'READ',
        sql: rawQuery.trim(),
        originalQuery: rawQuery.trim(),
        query: cleanQuery,
        cypher: cleanQuery,
        generatedCypher: cleanQuery,
        params,
        count: Array.isArray(rows) ? rows.length : 0,
        columns,
        rows: Array.isArray(rows) ? rows : [],
        data: Array.isArray(rows) ? rows : [],
        executionTimeMs
      });
    }

    const result = await execute(cleanQuery, params);
    const diff = process.hrtime(startTime);
    const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

    const rawRows = Array.isArray(result.rows) ? result.rows : [];
    const { columns, rows } = unwrapRecords(rawRows);

    const summary = result.summary || {};
    const totalChanges =
      (summary.nodesCreated || 0) +
      (summary.nodesDeleted || 0) +
      (summary.relationshipsCreated || 0) +
      (summary.relationshipsDeleted || 0) +
      (summary.propertiesSet || 0);

    return res.json({
      success: true,
      type: 'WRITE',
      sql: rawQuery.trim(),
      originalQuery: rawQuery.trim(),
      query: cleanQuery,
      cypher: cleanQuery,
      generatedCypher: cleanQuery,
      params,
      changes: totalChanges || 1,
      count: rows.length,
      columns,
      rows,
      data: rows,
      summary,
      message: `SQL operation executed successfully.${totalChanges > 0 ? ` (${totalChanges} change${totalChanges === 1 ? '' : 's'})` : ''}`,
      executionTimeMs
    });
  } catch (error) {
    console.error('Error executing query:', error);
    return res.status(400).json({
      success: false,
      error: error.message,
      message: error.message,
      sql: req.body.sql || req.body.query || req.body.cypher
    });
  }
});

// GET /api/query/schema - Schema reference for SQL Studio (Tables, Node Labels, Relationships, Entities)
router.get('/schema', async (req, res) => {
  try {
    res.json({
      success: true,
      tables: TABLE_SCHEMAS,
      nodeLabels: NODE_LABELS,
      relationships: RELATIONSHIPS,
      entities: ENTITIES
    });
  } catch (error) {
    console.error('Error fetching schema for query studio:', error);
    res.status(500).json({ success: false, error: error.message, message: error.message });
  }
});

module.exports = router;
