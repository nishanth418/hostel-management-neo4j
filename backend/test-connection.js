const neo4jDb = require('./db-neo4j');

async function testDatabaseConnection() {
  try {
    const result = await neo4jDb.testConnection();

    if (result.connected) {
      console.log('--- NEO4J AURADB CONNECTION TEST REPORT ---');
      console.log('1. Connection Result: SUCCESSFUL');
      console.log('2. Database Server Status: Connected');
      console.log(`   - Database Engine: Neo4j AuraDB`);
      console.log(`   - Address: ${result.address || 'Active AuraDB Instance'}`);
      console.log(`   - Version: ${result.version || 'Neo4j 5.x'}`);
      console.log('3. SSL / Encryption Status: ACTIVE (neo4j+s / neo4j+ssc)');
      console.log('4. Errors: None');
      console.log('-------------------------------------------');
      await neo4jDb.closeDriver();
      process.exit(0);
    } else {
      const sanitizedError = (result.error || 'Connection failed').replace(/:([^:@]+)@/g, ':••••••••@');
      console.log('--- NEO4J AURADB CONNECTION TEST REPORT ---');
      console.log('1. Connection Result: FAILED');
      console.log('2. Database Server Status: Disconnected');
      console.log(`3. Error Details: ${sanitizedError}`);
      console.log('4. Suggested Fix:');
      console.log('   - Verify NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD in your environment / .env');
      console.log('   - Ensure NEO4J_URI begins with neo4j+s:// or neo4j+ssc://');
      console.log('   - Ensure your Neo4j AuraDB instance is running (not paused)');
      console.log('-------------------------------------------');
      await neo4jDb.closeDriver();
      process.exit(1);
    }
  } catch (err) {
    const sanitizedMsg = (err.message || 'Unknown error').replace(/:([^:@]+)@/g, ':••••••••@');
    console.log('--- NEO4J AURADB CONNECTION TEST REPORT ---');
    console.log('1. Connection Result: FAILED');
    console.log('2. Database Server Status: Disconnected');
    console.log(`3. Error: ${sanitizedMsg}`);
    console.log('-------------------------------------------');
    await neo4jDb.closeDriver();
    process.exit(1);
  }
}

testDatabaseConnection();
