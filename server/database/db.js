const mysql = require('mysql2/promise');

require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    minVersion: 'TLSv1.2',
    // rejectUnauthorized: false
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
// Verify connection on startup
pool.getConnection()
  .then(conn => {
    console.log('Connected to the MySQL database.');
    conn.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL:', err.message);
  });

// Transaction connection holder (mirrors the original SQLite singleton pattern)
let txnConnection = null;

// Promisified wrapper that matches the original SQLite dbAsync API exactly
const dbAsync = {
  get: async (sql, params = []) => {
    const conn = txnConnection || pool;
    const [rows] = await conn.execute(sql, params);
    return rows[0] || undefined;
  },

  all: async (sql, params = []) => {
    const conn = txnConnection || pool;
    const [rows] = await conn.execute(sql, params);
    return rows;
  },

  run: async (sql, params = []) => {
    const conn = txnConnection || pool;
    const [result] = await conn.execute(sql, params);
    return { id: result.insertId, changes: result.affectedRows };
  },

  beginTransaction: async () => {
    txnConnection = await pool.getConnection();
    await txnConnection.beginTransaction();
  },

  commit: async () => {
    if (txnConnection) {
      await txnConnection.commit();
      txnConnection.release();
      txnConnection = null;
    }
  },

  rollback: async () => {
    if (txnConnection) {
      await txnConnection.rollback();
      txnConnection.release();
      txnConnection = null;
    }
  }
};

module.exports = { pool, dbAsync };
