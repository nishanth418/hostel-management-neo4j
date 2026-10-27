/**
 * Automated Test Suite for SQL Studio & SQL-to-Cypher Translation
 * 
 * Tests parsing, translation, parameterization, and execution against the 
 * Neo4j AuraDB database.
 */

const { query, execute, testConnection } = require('./database');
const { translateSqlToCypher } = require('./sql-to-cypher');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('===============================================================');
  console.log('       SQL STUDIO & SQL-TO-CYPHER COMPREHENSIVE TEST SUITE     ');
  console.log('===============================================================\n');

  // Test 1: SELECT all columns
  console.log('1. Test: SELECT all columns');
  try {
    const t = translateSqlToCypher('SELECT * FROM Student;');
    assert(t.cypher.includes('MATCH (s:Student)'), 'Cypher matches Student node');
    assert(t.cypher.includes('RETURN s'), 'Cypher returns node');
    const rows = await query(t.cypher, t.params);
    assert(rows.length > 0, `Executed successfully, returned ${rows.length} students`);
  } catch (err) {
    assert(false, `SELECT * failed: ${err.message}`);
  }

  // Test 2: SELECT selected columns
  console.log('\n2. Test: SELECT selected columns');
  try {
    const t = translateSqlToCypher('SELECT firstName, lastName, roomNo FROM Student;');
    assert(t.cypher.includes('s.firstName AS firstName'), 'Includes projected firstName');
    assert(t.cypher.includes('s.roomNo AS roomNo'), 'Includes projected roomNo');
    const rows = await query(t.cypher, t.params);
    assert(rows.length > 0 && rows[0].firstName !== undefined, `Returned columns: ${Object.keys(rows[0] || {}).join(', ')}`);
  } catch (err) {
    assert(false, `SELECT selected columns failed: ${err.message}`);
  }

  // Test 3: WHERE conditions & comparison operators
  console.log('\n3. Test: WHERE conditions (=, !=, <, >, <=, >=, AND, OR, IN, BETWEEN, LIKE, IS NULL)');
  try {
    const t1 = translateSqlToCypher("SELECT * FROM Student WHERE gender = 'Male' AND planType = 'Premium';");
    assert(t1.params.p1 === 'Male' && t1.params.p2 === 'Premium', 'Parameters safely extracted for gender & planType');
    const rows1 = await query(t1.cypher, t1.params);
    assert(rows1.length > 0, `Returned ${rows1.length} filtered male premium students`);

    const t2 = translateSqlToCypher("SELECT * FROM Student WHERE studentId IN ('S1001', 'S1002');");
    assert(t2.cypher.includes('IN ['), 'Cypher IN clause constructed');
    const rows2 = await query(t2.cypher, t2.params);
    assert(rows2.length === 2, `IN clause returned exactly 2 records`);

    const t3 = translateSqlToCypher("SELECT * FROM Room WHERE roomRent BETWEEN 5000 AND 12000;");
    assert(t3.cypher.includes('>=') && t3.cypher.includes('<='), 'BETWEEN converted to range comparison');
    const rows3 = await query(t3.cypher, t3.params);
    assert(rows3.length > 0, `BETWEEN returned ${rows3.length} rooms`);

    const t4 = translateSqlToCypher("SELECT * FROM Student WHERE firstName LIKE 'Rah%';");
    assert(t4.cypher.includes('STARTS WITH'), 'LIKE "Rah%" converted to STARTS WITH');
    const rows4 = await query(t4.cypher, t4.params);
    assert(rows4.length >= 1, `STARTS WITH returned ${rows4.length} records`);

    const t5 = translateSqlToCypher("SELECT * FROM Student WHERE email IS NOT NULL;");
    assert(t5.cypher.includes('IS NOT NULL'), 'IS NOT NULL translated properly');
    const rows5 = await query(t5.cypher, t5.params);
    assert(rows5.length > 0, `IS NOT NULL returned ${rows5.length} records`);
  } catch (err) {
    assert(false, `WHERE conditions failed: ${err.message}`);
  }

  // Test 4: ORDER BY and LIMIT
  console.log('\n4. Test: ORDER BY and LIMIT');
  try {
    const t = translateSqlToCypher('SELECT studentId, firstName FROM Student ORDER BY firstName ASC LIMIT 2;');
    assert(t.cypher.includes('ORDER BY s.firstName ASC'), 'Order by translated');
    assert(t.cypher.includes('LIMIT 2'), 'Limit translated');
    const rows = await query(t.cypher, t.params);
    assert(rows.length === 2, `LIMIT 2 respected, returned ${rows.length} records`);
  } catch (err) {
    assert(false, `ORDER BY and LIMIT failed: ${err.message}`);
  }

  // Test 5: COUNT, SUM, AVG, MIN, MAX and GROUP BY
  console.log('\n5. Test: COUNT, SUM, AVG, MIN, MAX and GROUP BY');
  try {
    const t = translateSqlToCypher('SELECT gender, COUNT(*) AS total FROM Student GROUP BY gender;');
    assert(t.cypher.includes('count(*) AS total'), 'Count aggregation translated');
    const rows = await query(t.cypher, t.params);
    assert(rows.length >= 2, `GROUP BY returned groups: ${JSON.stringify(rows)}`);

    // Test aggregations: AVG, SUM, MIN, MAX
    const tAggr = translateSqlToCypher('SELECT count(*), avg(roomRent), min(roomRent), max(roomRent), sum(roomRent) FROM Room;');
    assert(tAggr.cypher.includes('avg(r.roomRent)'), 'AVG translated with column');
    assert(tAggr.cypher.includes('min(r.roomRent)'), 'MIN translated with column');
    assert(tAggr.cypher.includes('max(r.roomRent)'), 'MAX translated with column');
    assert(tAggr.cypher.includes('sum(r.roomRent)'), 'SUM translated with column');
    const aggrRows = await query(tAggr.cypher, tAggr.params);
    assert(aggrRows.length === 1, `Aggregate query executed, returned: ${JSON.stringify(aggrRows[0])}`);
  } catch (err) {
    assert(false, `COUNT, SUM, AVG, MIN, MAX failed: ${err.message}`);
  }

  // Test 6: INNER JOIN and LEFT JOIN
  console.log('\n6. Test: INNER JOIN and LEFT JOIN');
  try {
    const tInner = translateSqlToCypher('SELECT s.firstName, r.roomNo FROM Student s JOIN Room r ON s.roomNo = r.roomNo;');
    assert(tInner.cypher.includes('-[:ALLOCATED_TO]->'), 'Mapped to [:ALLOCATED_TO] graph relationship');
    const innerRows = await query(tInner.cypher, tInner.params);
    assert(innerRows.length > 0, `INNER JOIN returned ${innerRows.length} joined records`);

    const tLeft = translateSqlToCypher('SELECT s.firstName, r.roomNo FROM Student s LEFT JOIN Room r ON s.roomNo = r.roomNo;');
    assert(tLeft.cypher.includes('OPTIONAL MATCH'), 'LEFT JOIN uses OPTIONAL MATCH');
    const leftRows = await query(tLeft.cypher, tLeft.params);
    assert(leftRows.length >= innerRows.length, `LEFT JOIN returned ${leftRows.length} records`);
  } catch (err) {
    assert(false, `Joins failed: ${err.message}`);
  }

  // Test 7: Multiple Related Entities (Chained Joins)
  console.log('\n7. Test: Queries involving multiple related entities');
  try {
    const tMulti = translateSqlToCypher(
      'SELECT s.firstName, r.roomNo, h.name AS hostel FROM Student s JOIN Room r ON s.roomNo = r.roomNo JOIN Hostel h ON r.hostelId = h.hostelId;'
    );
    assert(tMulti.cypher.includes('-[:ALLOCATED_TO]->') && tMulti.cypher.includes('-[:LOCATED_IN]->'), 'Traversed Student->Room->Hostel relationships');
    const multiRows = await query(tMulti.cypher, tMulti.params);
    assert(multiRows.length > 0, `Multi-join returned ${multiRows.length} records: ${JSON.stringify(multiRows[0])}`);
  } catch (err) {
    assert(false, `Multiple joins failed: ${err.message}`);
  }

  // Test 8: Auxiliary Phone Table (Unwinding array)
  console.log('\n8. Test: Auxiliary Phone Table (UNWIND)');
  try {
    const tPhone = translateSqlToCypher('SELECT * FROM STUDENT_PHONE;');
    assert(tPhone.cypher.includes('UNWIND'), 'Unwinds phones array property');
    const phoneRows = await query(tPhone.cypher, tPhone.params);
    assert(phoneRows.length > 0, `Phone table returned ${phoneRows.length} telephone rows`);
  } catch (err) {
    assert(false, `Auxiliary phone query failed: ${err.message}`);
  }

  // Test 9: INSERT, UPDATE, DELETE (Controlled test record)
  console.log('\n9. Test: Data modification (INSERT, UPDATE, DELETE with controlled test record)');
  const testId = 'S_UNIT_' + Date.now();
  try {
    // 9a. INSERT
    const insertSql = `INSERT INTO Student (studentId, firstName, lastName, gender) VALUES ('${testId}', 'UnitTestUser', 'TestSingh', 'Male');`;
    const tIns = translateSqlToCypher(insertSql);
    assert(tIns.type === 'WRITE', 'INSERT marked as WRITE transaction');
    await execute(tIns.cypher, tIns.params);

    // Verify insert
    const verifySql = `SELECT studentId, firstName, gender FROM Student WHERE studentId = '${testId}';`;
    const tVer1 = translateSqlToCypher(verifySql);
    const verRows1 = await query(tVer1.cypher, tVer1.params);
    assert(verRows1.length === 1 && verRows1[0].firstName === 'UnitTestUser', 'Controlled test record verified inserted');

    // 9b. UPDATE with WHERE
    const updateSql = `UPDATE Student SET gender = 'Female', planType = 'Special' WHERE studentId = '${testId}';`;
    const tUpd = translateSqlToCypher(updateSql);
    assert(tUpd.type === 'WRITE', 'UPDATE marked as WRITE transaction');
    await execute(tUpd.cypher, tUpd.params);

    const verRows2 = await query(tVer1.cypher, tVer1.params);
    assert(verRows2.length === 1 && verRows2[0].gender === 'Female', 'Controlled record updated successfully');

    // 9c. DELETE with WHERE
    const deleteSql = `DELETE FROM Student WHERE studentId = '${testId}';`;
    const tDel = translateSqlToCypher(deleteSql);
    assert(tDel.type === 'WRITE', 'DELETE marked as WRITE transaction');
    assert(tDel.cypher.includes('DETACH DELETE'), 'DELETE uses safe DETACH DELETE');
    await execute(tDel.cypher, tDel.params);

    const verRows3 = await query(tVer1.cypher, tVer1.params);
    assert(verRows3.length === 0, 'Controlled record deleted and cleaned up');
  } catch (err) {
    assert(false, `DML cycle failed: ${err.message}`);
  }

  // Test 10: Invalid SQL handling
  console.log('\n10. Test: Invalid SQL handling');
  try {
    translateSqlToCypher('SELECT FROM WHERE ;;;');
    assert(false, 'Should have rejected malformed SQL');
  } catch (err) {
    assert(err.message.includes('SQL Syntax Error'), `Clean error caught: ${err.message}`);
  }

  // Test 11: Unsupported SQL features
  console.log('\n11. Test: Unsupported SQL statements (e.g. DROP TABLE)');
  try {
    translateSqlToCypher('DROP TABLE Student;');
    assert(false, 'Should have blocked DROP TABLE');
  } catch (err) {
    assert(err.message.includes('not supported in interactive SQL Studio'), `Readable rejection: ${err.message}`);
  }

  // Test 12: SQL Injection prevention via Parameterization
  console.log('\n12. Test: SQL Injection prevention');
  try {
    const malicious = "SELECT * FROM Student WHERE firstName = 'test\\' OR 1=1 --';";
    const t = translateSqlToCypher(malicious);
    assert(Object.keys(t.params).length > 0, 'Values are securely parameterized');
    assert(t.cypher.includes('$p'), 'Cypher uses parameter placeholders instead of string concatenation');
  } catch (err) {
    assert(false, `Injection test failed: ${err.message}`);
  }

  // Test 13: Zero record query handling
  console.log('\n13. Test: Queries returning zero records');
  try {
    const t = translateSqlToCypher("SELECT * FROM Student WHERE studentId = 'NONEXISTENT_99999';");
    const rows = await query(t.cypher, t.params);
    assert(Array.isArray(rows) && rows.length === 0, 'Cleanly returns empty array for 0 matches');
  } catch (err) {
    assert(false, `Zero match query failed: ${err.message}`);
  }

  console.log('\n===============================================================');
  console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('===============================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
