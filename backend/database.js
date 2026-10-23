const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const neo4jDb = require('./db-neo4j');
const { initNeo4j } = require('./init-neo4j');

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

/**
 * Universal query runner for Cypher operations
 */
async function query(cypher, params = {}) {
  return await neo4jDb.query(cypher, params);
}

/**
 * Universal execute runner for Cypher write operations
 */
async function execute(cypher, params = {}) {
  return await neo4jDb.execute(cypher, params);
}

/**
 * Retrieve list of 18 application tables / entity names
 */
async function getApplicationTables() {
  return REQUIRED_TABLES;
}

/**
 * Verification of database readiness
 */
async function verifyDatabase() {
  const conn = await neo4jDb.testConnection();
  if (conn.connected) {
    console.log('\n SUCCESS: Connected to Neo4j AuraDB.');
    return { success: true, count: REQUIRED_TABLES.length, tables: REQUIRED_TABLES };
  } else {
    console.warn('\n WARNING: Neo4j AuraDB connection not active:', conn.error || 'Check environment configuration.');
    return { success: false, error: conn.error };
  }
}

/**
 * Health status for /api/health endpoint
 */
async function getHealthStatus() {
  const connTest = await neo4jDb.testConnection();
  if (!connTest.connected) {
    return {
      status: 'unhealthy',
      database: 'disconnected',
      engine: 'Neo4j AuraDB',
      error: connTest.error || 'Database disconnected',
      timestamp: new Date().toISOString()
    };
  }

  return {
    status: 'healthy',
    database: 'connected',
    engine: 'Neo4j AuraDB',
    totalApplicationTables: REQUIRED_TABLES.length,
    tables: REQUIRED_TABLES,
    foreignKeysEnforced: true,
    serviceDetails: {
      address: connTest.address,
      version: connTest.version
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Initialize Neo4j constraints, indexes, and seed records
 */
async function initDatabase(force = false) {
  return await initNeo4j(true);
}

module.exports = {
  neo4jDb,
  query,
  execute,
  getApplicationTables,
  verifyDatabase,
  getHealthStatus,
  initDatabase,
  REQUIRED_TABLES
};
