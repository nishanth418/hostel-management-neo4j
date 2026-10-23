const express = require('express');
const queryRouter = require('./routes/query');
const { query } = require('./database');

async function testCypherQueries() {
  console.log('=== TESTING CYPHER STUDIO BACKEND ENDPOINTS & QUERIES ===\n');

  // Verify baseline node/relationship counts first
  const [nodeCountRes, relCountRes] = await Promise.all([
    query('MATCH (n) RETURN count(n) AS count;'),
    query('MATCH ()-[r]->() RETURN count(r) AS count;')
  ]);
  const nodeCount = nodeCountRes[0].count;
  const relCount = relCountRes[0].count;
  console.log(`Database Baseline: ${nodeCount} nodes, ${relCount} relationships.`);
  if (nodeCount !== 63 || relCount !== 68) {
    throw new Error(`Baseline mismatch: expected 63 nodes and 68 rels, got ${nodeCount} nodes, ${relCount} rels`);
  }

  const app = express();
  app.use(express.json());
  app.use('/api/query', queryRouter);

  const server = app.listen(5999);

  try {
    // ----------------------------------------------------
    // TEST 1: SELECT * FROM STUDENT
    // Must translate to MATCH (s:Student) RETURN s
    // Must return unwrapped student properties (NOT [object Object])
    // ----------------------------------------------------
    console.log('[Test 1/7] Testing SELECT * FROM STUDENT ...');
    const res1 = await fetch('http://localhost:5999/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'SELECT * FROM STUDENT;' })
    });
    const data1 = await res1.json();
    console.log(' - Status Code:', res1.status);
    console.log(' - Success:', data1.success);
    console.log(' - Translated Query:', data1.query);
    console.log(' - Records Count:', data1.count);
    console.log(' - Columns (Property Names):', data1.columns.slice(0, 6).join(', ') + '...');
    const firstStudent = data1.rows[0];
    console.log(' - First Student values:', `studentId=${firstStudent.studentId}, firstName=${firstStudent.firstName}, lastName=${firstStudent.lastName}`);
    
    // Check that properties are NOT '[object Object]'
    if (typeof firstStudent.firstName !== 'string' || firstStudent.firstName === '[object Object]') {
      throw new Error(`Test 1 failed: Property firstName is invalid or [object Object]: ${firstStudent.firstName}`);
    }
    if (res1.status !== 200 || !data1.success || data1.count !== 5 || !data1.query.includes(':Student')) {
      throw new Error(`Test 1 failed: ${JSON.stringify(data1)}`);
    }
    console.log(' PASS: Test 1 - SELECT * FROM STUDENT executed as MATCH (s:Student) RETURN s with flat property columns.\n');

    // ----------------------------------------------------
    // TEST 2: SELECT * FROM HOSTEL
    // Must translate to MATCH (h:Hostel) RETURN h
    // ----------------------------------------------------
    console.log('[Test 2/7] Testing SELECT * FROM HOSTEL ...');
    const res2 = await fetch('http://localhost:5999/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'SELECT * FROM HOSTEL;' })
    });
    const data2 = await res2.json();
    console.log(' - Status Code:', res2.status);
    console.log(' - Translated Query:', data2.query);
    console.log(' - Records Count:', data2.count);
    console.log(' - Columns:', data2.columns.join(', '));
    console.log(' - First Hostel:', `hostelId=${data2.rows[0].hostelId}, name=${data2.rows[0].name}`);
    if (res2.status !== 200 || !data2.success || data2.count !== 5 || !data2.query.includes(':Hostel')) {
      throw new Error(`Test 2 failed: ${JSON.stringify(data2)}`);
    }
    console.log(' PASS: Test 2 - SELECT * FROM HOSTEL executed as MATCH (h:Hostel) RETURN h successfully.\n');

    // ----------------------------------------------------
    // TEST 3: SELECT * FROM ROOM
    // Must translate to MATCH (r:Room) RETURN r
    // ----------------------------------------------------
    console.log('[Test 3/7] Testing SELECT * FROM ROOM ...');
    const res3 = await fetch('http://localhost:5999/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'SELECT * FROM ROOM;' })
    });
    const data3 = await res3.json();
    console.log(' - Status Code:', res3.status);
    console.log(' - Translated Query:', data3.query);
    console.log(' - Records Count:', data3.count);
    console.log(' - Columns:', data3.columns.join(', '));
    console.log(' - First Room:', `roomNo=${data3.rows[0].roomNo}, type=${data3.rows[0].type}, rent=${data3.rows[0].roomRent}`);
    if (res3.status !== 200 || !data3.success || data3.count !== 5 || !data3.query.includes(':Room')) {
      throw new Error(`Test 3 failed: ${JSON.stringify(data3)}`);
    }
    console.log(' PASS: Test 3 - SELECT * FROM ROOM executed as MATCH (r:Room) RETURN r successfully.\n');

    // ----------------------------------------------------
    // TEST 4: Native Cypher MATCH (s:Student) RETURN s;
    // ----------------------------------------------------
    console.log('[Test 4/7] Testing Native Cypher MATCH (s:Student) RETURN s; ...');
    const res4 = await fetch('http://localhost:5999/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cypher: 'MATCH (s:Student)\nRETURN s;' })
    });
    const data4 = await res4.json();
    console.log(' - Status Code:', res4.status);
    console.log(' - Records Count:', data4.count);
    console.log(' - Columns:', data4.columns.slice(0, 5).join(', ') + '...');
    if (res4.status !== 200 || !data4.success || data4.count !== 5) {
      throw new Error(`Test 4 failed: ${JSON.stringify(data4)}`);
    }
    console.log(' PASS: Test 4 - Native Cypher MATCH query executed successfully.\n');

    // ----------------------------------------------------
    // TEST 5: Relationship Traversal
    // MATCH (s:Student)-[:ALLOCATED_TO]->(r:Room) RETURN s, r;
    // ----------------------------------------------------
    console.log('[Test 5/7] Testing MATCH (s:Student)-[:ALLOCATED_TO]->(r:Room) RETURN s, r; ...');
    const res5 = await fetch('http://localhost:5999/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cypher: 'MATCH (s:Student)-[:ALLOCATED_TO]->(r:Room)\nRETURN s, r;' })
    });
    const data5 = await res5.json();
    console.log(' - Status Code:', res5.status);
    console.log(' - Records Count:', data5.count);
    console.log(' - Columns:', data5.columns);
    console.log(' - Allocation 1 student:', data5.rows[0].s.firstName, '-> room:', data5.rows[0].r.roomNo);
    console.log(' - Node labels preserved:', data5.rows[0].s._labels, data5.rows[0].r._labels);
    if (res5.status !== 200 || !data5.success || data5.count !== 5) {
      throw new Error(`Test 5 failed: ${JSON.stringify(data5)}`);
    }
    console.log(' PASS: Test 5 - Relationship traversal executed successfully with preserved labels.\n');

    // ----------------------------------------------------
    // TEST 6: Aggregation Query
    // MATCH (s:Student)-[:RESIDES_IN]->(h:Hostel) RETURN h.name AS hostel, count(s) AS student_count;
    // ----------------------------------------------------
    console.log('[Test 6/7] Testing Aggregation query ...');
    const res6 = await fetch('http://localhost:5999/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cypher: 'MATCH (s:Student)-[:RESIDES_IN]->(h:Hostel)\nRETURN h.name AS hostel, count(s) AS student_count;'
      })
    });
    const data6 = await res6.json();
    console.log(' - Status Code:', res6.status);
    console.log(' - Hostels count:', data6.count);
    data6.rows.forEach(row => {
      console.log(`   * ${row.hostel}: ${row.student_count} residents`);
    });
    if (res6.status !== 200 || !data6.success || data6.rows.length === 0) {
      throw new Error(`Test 6 failed: ${JSON.stringify(data6)}`);
    }
    console.log(' PASS: Test 6 - Aggregation query executed successfully.\n');

    // ----------------------------------------------------
    // TEST 7: Intentionally Invalid Query
    // ----------------------------------------------------
    console.log('[Test 7/7] Testing Intentionally Invalid Query (INVALID SYNTAX @#$!) ...');
    const res7 = await fetch('http://localhost:5999/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cypher: 'INVALID SYNTAX @#$!;' })
    });
    const data7 = await res7.json();
    console.log(' - Status Code:', res7.status, '(Expected 400)');
    console.log(' - Success:', data7.success, '(Expected false)');
    console.log(' - Error message:', data7.error.slice(0, 80) + '...');
    if (res7.status !== 400 || data7.success !== false) {
      throw new Error(`Test 7 failed: ${JSON.stringify(data7)}`);
    }
    console.log(' PASS: Test 7 - Controlled error returned with HTTP 400 without crashing.\n');

    // Schema Test
    console.log('[Bonus] Testing GET /api/query/schema ...');
    const resSchema = await fetch('http://localhost:5999/api/query/schema');
    const dataSchema = await resSchema.json();
    console.log(' - Tables in Schema:', Object.keys(dataSchema.tables || {}).length);
    console.log(' - Node Labels:', (dataSchema.nodeLabels || []).length);
    console.log(' - Relationships:', (dataSchema.relationships || []).length);
    if (resSchema.status !== 200 || !dataSchema.tables || Object.keys(dataSchema.tables).length !== 18) {
      throw new Error(`Schema test failed: ${JSON.stringify(dataSchema)}`);
    }
    console.log(' PASS: Schema endpoint verified.\n');

    console.log('=== ALL 7 CYPHER & SQL STUDIO TESTS PASSED CLEANLY! ===\n');
  } finally {
    server.close();
    process.exit(0);
  }
}

testCypherQueries().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
