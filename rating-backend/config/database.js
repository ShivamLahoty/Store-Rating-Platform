const mysql = require('mysql2')
const dotenv = require('dotenv')

dotenv.config()

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Promise wrapper for easier async/await usage
const promisePool = pool.promise()

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database:', err.message)
    return
  }
  console.log('Connected to MySQL database successfully')
  connection.release()
})

module.exports = promisePool
