import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Execute SQL queries
export async function executeQuery({ query, values = [] }) {
  try {
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// --- Authentication/User Functions ---

// Get a user by either username or employee ID
export async function getUserByIdentifier(identifier) {
  try {
    const users = await executeQuery({
      query: 'SELECT * FROM admin_users WHERE username = ? OR employee_id = ?',
      values: [identifier, identifier],
    });
    return users.length ? users[0] : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}