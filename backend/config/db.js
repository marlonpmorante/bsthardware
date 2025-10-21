// config/db.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Build a MySQL config that works locally and on Railway
function resolveMysqlConfig() {
  // Prefer DATABASE_URL if it points to MySQL (Railway sometimes provides this)
  const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  if (databaseUrl && databaseUrl.startsWith('mysql://')) {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
      queueLimit: 0,
      // Enable SSL only if explicitly requested
      ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    };
  }

  // Railway MySQL specific env vars
  if (process.env.MYSQLHOST) {
    return {
      host: process.env.MYSQLHOST,
      port: Number(process.env.MYSQLPORT || 3306),
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
      queueLimit: 0,
      ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    };
  }

  // Fallback to generic DB_* env vars (local dev)
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
    queueLimit: 0,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  };
}

const pool = mysql.createPool(resolveMysqlConfig());

async function initDatabase() {
  try {
    // Simple connectivity check
    await pool.query('SELECT 1');
    console.log('Database connection established');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    const exitOnFailEnv = process.env.DB_EXIT_ON_FAIL;
    const exitOnFail = exitOnFailEnv === undefined ? true : exitOnFailEnv === 'true';
    if (exitOnFail) {
      process.exit(1);
    } else {
      console.warn('Continuing without a database connection because DB_EXIT_ON_FAIL is set to false');
    }
  }
}

module.exports = { pool, initDatabase };