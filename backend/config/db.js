// config/db.js
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config(); // Ensure environment variables are loaded here too

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Max number of concurrent connections
    queueLimit: 0 // No limit on queued requests
});

const initDatabase = () => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Database connection failed:', err.stack);
            // Consider exiting the process or implementing a retry mechanism
            process.exit(1);
            return;
        }
        console.log('Connected to database as ID ' + connection.threadId);
        connection.release(); // Release the connection back to the pool immediately
    });
};

module.exports = {
    pool,
    initDatabase
};