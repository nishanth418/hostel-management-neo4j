const neo4j = require('neo4j-driver');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

let driverInstance = null;

function isConfigured() {
  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;
  return Boolean(uri && username && password);
}

function getDriver() {
  if (!driverInstance) {
    const uri = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !username || !password) {
      throw new Error(
        'Neo4j connection environment variables missing. Please configure NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD.'
      );
    }

    driverInstance = neo4j.driver(
      uri,
      neo4j.auth.basic(username, password),
      {
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 30000,
        disableLosslessIntegers: false
      }
    );
  }
  return driverInstance;
}

/**
 * Recursively convert Neo4j types (Integer, Node, Relationship, Date) to native JavaScript primitives
 */
function toNative(val) {
  if (val === null || val === undefined) {
    return val;
  }
  if (neo4j.isInt(val)) {
    return val.inSafeRange() ? val.toNumber() : val.toString();
  }
  if (Array.isArray(val)) {
    return val.map(toNative);
  }
  if (neo4j.isNode(val) || neo4j.isRelationship(val)) {
    return toNative(val.properties);
  }
  if (typeof val === 'object') {
    // Neo4j Date, DateTime, LocalDateTime objects
    if (typeof val.toString === 'function' && val.constructor && val.constructor.name && ['Date', 'DateTime', 'LocalDateTime', 'Time', 'LocalTime', 'Duration'].includes(val.constructor.name)) {
      return val.toString();
    }
    const result = {};
    for (const key of Object.keys(val)) {
      result[key] = toNative(val[key]);
    }
    return result;
  }
  return val;
}

/**
 * Execute a read Cypher query and return array of flat row objects
 */
async function query(cypher, params = {}) {
  const driver = getDriver();
  const session = driver.session({ defaultAccessMode: neo4j.session.READ });
  try {
    const result = await session.run(cypher, params);
    return result.records.map(record => {
      const row = {};
      record.keys.forEach(key => {
        row[key] = toNative(record.get(key));
      });
      return row;
    });
  } finally {
    await session.close();
  }
}

/**
 * Execute a write Cypher statement (MERGE, CREATE, SET, DELETE)
 */
async function execute(cypher, params = {}) {
  const driver = getDriver();
  const session = driver.session({ defaultAccessMode: neo4j.session.WRITE });
  try {
    const result = await session.run(cypher, params);
    const rows = result.records.map(record => {
      const row = {};
      record.keys.forEach(key => {
        row[key] = toNative(record.get(key));
      });
      return row;
    });

    const updates = result.summary.counters.updates();
    return {
      success: true,
      records: rows,
      rows,
      summary: {
        nodesCreated: updates.nodesCreated,
        nodesDeleted: updates.nodesDeleted,
        relationshipsCreated: updates.relationshipsCreated,
        relationshipsDeleted: updates.relationshipsDeleted,
        propertiesSet: updates.propertiesSet
      }
    };
  } finally {
    await session.close();
  }
}

/**
 * Test connectivity to Neo4j instance
 */
async function testConnection() {
  try {
    const driver = getDriver();
    const serverInfo = await driver.getServerInfo();
    return {
      connected: true,
      engine: 'Neo4j AuraDB',
      address: serverInfo.address,
      version: serverInfo.version,
      protocolVersion: serverInfo.protocolVersion
    };
  } catch (err) {
    return {
      connected: false,
      engine: 'Neo4j AuraDB',
      error: err.message
    };
  }
}

async function closeDriver() {
  if (driverInstance) {
    await driverInstance.close();
    driverInstance = null;
  }
}

module.exports = {
  getDriver,
  isConfigured,
  query,
  execute,
  toNative,
  testConnection,
  closeDriver
};
