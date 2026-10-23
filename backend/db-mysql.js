const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const SCHEMA_MYSQL_PATH = path.resolve(__dirname, '../database/schema_mysql.sql');

// 18 Application Tables required
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

function hasValidDatabaseUrl() {
  if (!process.env.DATABASE_URL) return false;
  try {
    const parsed = new URL(process.env.DATABASE_URL);
    return Boolean(parsed.hostname && parsed.hostname.trim());
  } catch (_) {
    return false;
  }
}

function isMySQLConfigured() {
  return Boolean(
    hasValidDatabaseUrl() ||
    (process.env.DB_HOST && process.env.DB_HOST.trim())
  );
}

function getPoolConfig() {
  const isSsl = process.env.DB_SSL !== 'false' && (
    process.env.DB_SSL === 'true' ||
    process.env.DB_SSL === '1' ||
    Boolean(process.env.DATABASE_URL)
  );
  const sslConfig = isSsl ? { rejectUnauthorized: false } : undefined;

  if (hasValidDatabaseUrl()) {
    try {
      const parsedUrl = new URL(process.env.DATABASE_URL);
      return {
        host: parsedUrl.hostname,
        port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : 3306,
        user: decodeURIComponent(parsedUrl.username),
        password: decodeURIComponent(parsedUrl.password),
        database: parsedUrl.pathname.replace(/^\//, '') || 'defaultdb',
        ssl: sslConfig,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        multipleStatements: true
      };
    } catch (err) {
      console.warn('Failed to parse DATABASE_URL with new URL, fallback:', err.message);
    }
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'avnadmin',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'defaultdb',
    ssl: sslConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    multipleStatements: true
  };
}

let pool = null;

function getPool() {
  if (!pool) {
    const config = getPoolConfig();
    pool = mysql.createPool(config);
  }
  return pool;
}

/**
 * Execute a SELECT or returning query
 */
async function query(sql, params = []) {
  const p = getPool();
  const [rows] = await p.query(sql, params);
  return rows;
}

/**
 * Execute an INSERT / UPDATE / DELETE statement
 */
async function execute(sql, params = []) {
  const p = getPool();
  const [result] = await p.execute(sql, params);
  return result;
}

/**
 * Run operations within a transaction
 */
async function transaction(callback) {
  const p = getPool();
  const connection = await p.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Fetch all application tables from MySQL
 */
async function getApplicationTables() {
  const rows = await query(`
    SELECT TABLE_NAME as name 
    FROM information_schema.tables 
    WHERE table_schema = DATABASE() 
      AND table_type = 'BASE TABLE'
    ORDER BY TABLE_NAME ASC;
  `);
  return rows.map(r => r.name);
}

/**
 * Initialize MySQL schema
 */
async function initDatabase(force = false) {
  const existingTables = await getApplicationTables();
  if (existingTables.length === 18 && !force) {
    console.log(`MySQL Database already initialized with ${existingTables.length} tables.`);
    return { initialized: false, tables: existingTables };
  }

  console.log('Initializing MySQL database schema...');
  if (fs.existsSync(SCHEMA_MYSQL_PATH)) {
    const schemaSql = fs.readFileSync(SCHEMA_MYSQL_PATH, 'utf-8');
    const p = getPool();
    await p.query(schemaSql);
  } else {
    throw new Error(`MySQL schema file not found at ${SCHEMA_MYSQL_PATH}`);
  }

  const tables = await getApplicationTables();
  console.log(`MySQL database initialized successfully. Tables count: ${tables.length}`);
  return { initialized: true, tables };
}

/**
 * Verify presence of all 18 tables
 */
async function verifyDatabase() {
  const tables = await getApplicationTables();
  console.log(`\n--- VERIFYING MYSQL APPLICATION TABLES (Total: ${tables.length}) ---`);
  tables.forEach((t, i) => console.log(`${i + 1}. ${t}`));

  const missing = REQUIRED_TABLES.filter(t => !tables.includes(t));
  if (missing.length === 0 && tables.length === 18) {
    console.log('\n SUCCESS: Exactly the 18 expected application tables exist in MySQL.');
    return { success: true, count: tables.length, tables };
  } else {
    console.error('\n FAILURE: MySQL Tables mismatch!', { foundCount: tables.length, missing });
    return { success: false, count: tables.length, tables, missing };
  }
}

/**
 * Health check test
 */
async function testConnection() {
  try {
    const rows = await query('SELECT 1 as connected, DATABASE() as db, VERSION() as version');
    return { connected: true, details: rows[0] };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

module.exports = {
  getPool,
  query,
  execute,
  transaction,
  initDatabase,
  verifyDatabase,
  getApplicationTables,
  testConnection,
  isMySQLConfigured,
  REQUIRED_TABLES
};
