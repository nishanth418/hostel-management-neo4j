const neo4jDb = require('./db-neo4j');

const NODE_LABELS = [
  'Warden',
  'Hostel',
  'RoomType',
  'Room',
  'Student',
  'Mess',
  'Meal',
  'Staff',
  'Supplier',
  'InventoryItem',
  'Procurement',
  'Payment',
  'PaymentDetail'
];

async function verifyDatabase() {
  console.log('=== VERIFYING NEO4J AURADB GRAPH DATABASE ===\n');

  try {
    const conn = await neo4jDb.testConnection();
    if (!conn.connected) {
      const sanitizedError = (conn.error || 'Connection failed').replace(/:([^:@]+)@/g, ':••••••••@');
      console.log('Database Status: Disconnected');
      console.log('Error Details:', sanitizedError);
      process.exitCode = 1;
      return;
    }

    console.log('1. NODE LABELS AND RECORD COUNTS:');
    let totalNodes = 0;
    for (const label of NODE_LABELS) {
      const res = await neo4jDb.query(`MATCH (n:\`${label}\`) RETURN count(n) AS count`);
      const count = res[0] ? Number(res[0].count) : 0;
      console.log(` - ${label.padEnd(16)}: ${count} nodes`);
      totalNodes += count;
    }
    console.log(` Total nodes across all 13 labels: ${totalNodes}\n`);

    console.log('2. GRAPH RELATIONSHIP COUNTS:');
    const relRes = await neo4jDb.query(`
      MATCH ()-[r]->()
      RETURN type(r) AS relType, count(r) AS count
      ORDER BY count DESC
    `);
    let totalRels = 0;
    relRes.forEach(r => {
      console.log(` - [:${r.relType.padEnd(16)}]: ${r.count} relationships`);
      totalRels += Number(r.count);
    });
    console.log(` Total relationships in graph: ${totalRels}\n`);

    console.log('3. CONSTRAINT VERIFICATION:');
    try {
      const constraints = await neo4jDb.query(`SHOW CONSTRAINTS`);
      console.log(` Verified ${constraints.length} uniqueness constraints active in Neo4j.\n`);
    } catch (e) {
      console.log(' (SHOW CONSTRAINTS query not supported on this instance or permissions restricted)\n');
    }

    console.log(' SUCCESS: Neo4j AuraDB graph database verified.');
  } catch (err) {
    const sanitizedMsg = (err.message || 'Unknown error').replace(/:([^:@]+)@/g, ':••••••••@');
    console.error('Error verifying database:', sanitizedMsg);
    process.exitCode = 1;
  } finally {
    await neo4jDb.closeDriver();
  }
}

if (require.main === module) {
  verifyDatabase();
}

module.exports = { verifyDatabase };
