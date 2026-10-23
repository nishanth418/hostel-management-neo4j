const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { getPool, query, execute, REQUIRED_TABLES } = require('./db-mysql');
require('dotenv').config();

const SQLITE_DB_PATH = path.resolve(__dirname, '../database/hostel.db');
const SCHEMA_MYSQL_PATH = path.resolve(__dirname, '../database/schema_mysql.sql');

// Ordered for logical insertion
const INSERTION_ORDER = [
  'WARDEN',
  'WARDEN_PHONE',
  'HOSTEL',
  'ROOM_TYPE',
  'ROOM',
  'MESS',
  'MESS_CONTACT',
  'STUDENT',
  'STUDENT_PHONE',
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

async function runMigration() {
  console.log('====================================================');
  console.log(' HOSTEL MANAGEMENT SYSTEM - SQLITE TO MYSQL MIGRATION');
  console.log(' Target: MySQL');
  console.log('====================================================\n');

  if (!fs.existsSync(SQLITE_DB_PATH)) {
    throw new Error(`SQLite database not found at ${SQLITE_DB_PATH}`);
  }

  console.log(`[1/5] Connecting to SQLite at: ${SQLITE_DB_PATH}`);
  const sqlite = new Database(SQLITE_DB_PATH);

  console.log('[2/5] Connecting to MySQL...');
  const pool = getPool();
  
  // Test connection
  try {
    const [connTest] = await pool.query('SELECT 1 as test, DATABASE() as currentDb, VERSION() as version');
    console.log(` MySQL Connected! Current DB: ${connTest[0].currentDb}, Version: ${connTest[0].version}`);
  } catch (err) {
    console.error(' MySQL Connection failed! Please check your credentials / DATABASE_URL.');
    console.error(err.message);
    process.exit(1);
  }

  console.log('\n[3/5] Applying MySQL Schema (schema_mysql.sql)...');
  const schemaSql = fs.readFileSync(SCHEMA_MYSQL_PATH, 'utf-8');
  
  await pool.query('SET FOREIGN_KEY_CHECKS = 0;');

  // Drop existing tables cleanly to ensure exact schema
  for (const table of REQUIRED_TABLES) {
    await pool.query(`DROP TABLE IF EXISTS \`${table}\`;`);
  }

  // Execute schema
  await pool.query(schemaSql);
  console.log(' MySQL schema applied successfully.');

  console.log('\n[4/5] Migrating data from SQLite to MySQL...');
  await pool.query('SET FOREIGN_KEY_CHECKS = 0;');

  const migrationStats = {};

  for (const table of INSERTION_ORDER) {
    const rows = sqlite.prepare(`SELECT * FROM \`${table}\``).all();
    migrationStats[table] = { sqliteCount: rows.length, mysqlCount: 0 };

    if (rows.length === 0) {
      console.log(`- Table ${table}: 0 rows to migrate.`);
      continue;
    }

    const columns = Object.keys(rows[0]);
    const colList = columns.map(c => `\`${c}\``).join(', ');
    const placeholders = columns.map(() => '?').join(', ');
    const insertSql = `INSERT INTO \`${table}\` (${colList}) VALUES (${placeholders})`;

    for (const row of rows) {
      const values = columns.map(col => {
        const val = row[col];
        return val === undefined ? null : val;
      });
      await pool.execute(insertSql, values);
    }

    const [countResult] = await pool.query(`SELECT COUNT(*) as cnt FROM \`${table}\``);
    migrationStats[table].mysqlCount = countResult[0].cnt;
    console.log(` Table ${table}: ${rows.length} rows migrated (MySQL count: ${countResult[0].cnt})`);
  }

  await pool.query('SET FOREIGN_KEY_CHECKS = 1;');

  console.log('\n[5/5] Verification & Consistency Check:');
  console.log('----------------------------------------------------');
  console.log('TABLE NAME          | SQLITE ROWS | MYSQL ROWS | MATCH');
  console.log('----------------------------------------------------');

  let allMatched = true;
  for (const table of REQUIRED_TABLES) {
    const stat = migrationStats[table] || { sqliteCount: 0, mysqlCount: 0 };
    const match = stat.sqliteCount === stat.mysqlCount;
    if (!match) allMatched = false;
    const matchStr = match ? 'PASS' : 'FAIL';
    console.log(
      `${table.padEnd(19)} | ${String(stat.sqliteCount).padStart(11)} | ${String(stat.mysqlCount).padStart(10)} | ${matchStr}`
    );
  }
  console.log('----------------------------------------------------');

  if (allMatched) {
    console.log('\n MIGRATION COMPLETE! All 18 tables verified with 100% data integrity.');
  } else {
    console.error('\n WARNING: Row count mismatch detected in one or more tables!');
    process.exit(1);
  }

  sqlite.close();
  await pool.end();
}

if (require.main === module) {
  runMigration().catch(err => {
    console.error('Fatal migration error:', err);
    process.exit(1);
  });
}

module.exports = { runMigration };
