const fs = require('fs');
const path = require('path');
const { getDriver, isConfigured, closeDriver } = require('./db-neo4j');

const SCHEMA_CYPHER_PATH = path.resolve(__dirname, '../database/schema.cypher');
const SEED_CYPHER_PATH = path.resolve(__dirname, '../database/seed.cypher');

function splitCypherStatements(fileContent) {
  // Split on semicolons that terminate statements, ignoring comments
  return fileContent
    .split(';')
    .map(stmt => {
      // Remove line comments and trim
      return stmt
        .split('\n')
        .filter(line => !line.trim().startsWith('//'))
        .join('\n')
        .trim();
    })
    .filter(stmt => stmt.length > 0);
}

async function initNeo4j(seedData = true) {
  console.log('====================================================');
  console.log(' HOSTEL MANAGEMENT SYSTEM - NEO4J INITIALIZATION');
  console.log(' Target: Neo4j AuraDB');
  console.log('====================================================\n');

  if (!isConfigured()) {
    console.error('ERROR: Neo4j environment variables (NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD) are not set.');
    return { success: false, error: 'Environment variables not configured' };
  }

  const driver = getDriver();
  const session = driver.session();

  try {
    // 1. Verify connection
    console.log('[1/4] Verifying connectivity to Neo4j...');
    const serverInfo = await driver.getServerInfo();
    console.log(`Connected to: ${serverInfo.address} (${serverInfo.agent || 'Neo4j'})`);

    // 2. Apply Constraints and Indexes
    console.log('\n[2/4] Applying Schema Constraints and Indexes...');
    if (fs.existsSync(SCHEMA_CYPHER_PATH)) {
      const schemaStatements = splitCypherStatements(fs.readFileSync(SCHEMA_CYPHER_PATH, 'utf-8'));
      for (const stmt of schemaStatements) {
        try {
          await session.run(stmt);
        } catch (err) {
          // If constraint already exists, continue gracefully
          if (!err.message.includes('already exists') && !err.message.includes('An equivalent constraint already exists')) {
            console.warn(` Warning applying constraint: ${err.message}`);
          }
        }
      }
      console.log(` Applied ${schemaStatements.length} constraint/index definitions.`);
    } else {
      console.warn(` Schema file not found at ${SCHEMA_CYPHER_PATH}`);
    }

    // 3. Apply Seed Data
    if (seedData) {
      console.log('\n[3/4] Applying Graph Seed Records (Idempotent MERGE)...');
      if (fs.existsSync(SEED_CYPHER_PATH)) {
        const seedStatements = splitCypherStatements(fs.readFileSync(SEED_CYPHER_PATH, 'utf-8'));
        let executed = 0;
        for (const stmt of seedStatements) {
          await session.run(stmt);
          executed++;
        }
        console.log(` Executed ${executed} seed Cypher statements successfully.`);
      } else {
        console.warn(` Seed file not found at ${SEED_CYPHER_PATH}`);
      }
    }

    // 4. Verification and metrics summary
    console.log('\n[4/4] Verifying Graph Database Metrics:');
    console.log('----------------------------------------------------');
    const countLabels = [
      'Warden', 'Hostel', 'RoomType', 'Room', 'Student',
      'Mess', 'Meal', 'Staff', 'Supplier', 'InventoryItem',
      'Procurement', 'Payment', 'PaymentDetail'
    ];

    let totalNodes = 0;
    for (const label of countLabels) {
      const res = await session.run(`MATCH (n:\`${label}\`) RETURN count(n) AS cnt`);
      const cnt = res.records[0].get('cnt').toNumber();
      totalNodes += cnt;
      console.log(` - ${label.padEnd(16)}: ${cnt} nodes`);
    }

    const relRes = await session.run(`MATCH ()-[r]->() RETURN count(r) AS cnt`);
    const totalRels = relRes.records[0].get('cnt').toNumber();

    console.log('----------------------------------------------------');
    console.log(` TOTAL GRAPH NODES:         ${totalNodes}`);
    console.log(` TOTAL GRAPH RELATIONSHIPS: ${totalRels}`);
    console.log('====================================================');
    console.log(' NEO4J AURADB INITIALIZATION COMPLETE AND VERIFIED!');
    console.log('====================================================\n');

    return { success: true, totalNodes, totalRels };
  } catch (err) {
    const sanitizedMsg = (err.message || 'Unknown error').replace(/:([^:@]+)@/g, ':••••••••@');
    console.error('Fatal initialization error:', sanitizedMsg);
    throw new Error(sanitizedMsg);
  } finally {
    await session.close();
  }
}

if (require.main === module) {
  initNeo4j(true)
    .then(async (res) => {
      await closeDriver();
      if (!res || res.success === false) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch(async (err) => {
      const sanitizedMsg = (err.message || 'Unknown error').replace(/:([^:@]+)@/g, ':••••••••@');
      console.error('Fatal initialization error:', sanitizedMsg);
      await closeDriver();
      process.exit(1);
    });
}

module.exports = { initNeo4j };
