const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 1. Automatically load configuration from .env if present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'root',
  database: process.env.DB_NAME || 'rfid_attendance',
};

// 2. Define seed accounts for all 4 roles
const seedAccounts = [
  {
    role: 'superadmin',
    name: 'Super Administrator',
    username: 'superadmin',
    employeeId: '00-00000',
    password: 'superadmin123',
  },
  {
    role: 'admin',
    name: 'System Administrator',
    username: 'admin',
    employeeId: '01-00000',
    password: 'admin123',
  },
  {
    role: 'security',
    name: 'Security Guard',
    username: 'security',
    employeeId: '02-00000',
    password: 'security123',
  },
  {
    role: 'hr',
    name: 'HR Manager',
    username: 'hr',
    employeeId: '03-00000',
    password: 'hr123',
  },
];

async function seedUsers() {
  console.log('🔄 Connecting to MySQL database...');
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log(`✅ Connected to database: ${dbConfig.database} @ ${dbConfig.host}\n`);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }

  console.log('🌱 Seeding admin accounts for all roles (superadmin, admin, security, hr)...\n');

  const summary = [];

  for (const acc of seedAccounts) {
    try {
      const hashedPassword = await bcrypt.hash(acc.password, 10);

      // Upsert: Insert or Update if username or employee_id already exists
      const query = `
        INSERT INTO admin_users (name, username, employee_id, password, role)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          password = VALUES(password),
          role = VALUES(role)
      `;

      await connection.execute(query, [
        acc.name,
        acc.username,
        acc.employeeId,
        hashedPassword,
        acc.role,
      ]);

      summary.push({
        Role: acc.role,
        Username: acc.username,
        Password: acc.password,
        'Employee ID': acc.employeeId,
        Status: 'Created / Updated',
      });
      console.log(`✅ [${acc.role.toUpperCase()}] '${acc.username}' seeded successfully.`);
    } catch (error) {
      summary.push({
        Role: acc.role,
        Username: acc.username,
        Password: acc.password,
        'Employee ID': acc.employeeId,
        Status: `Failed: ${error.message}`,
      });
      console.error(`❌ Failed to seed ${acc.username}:`, error.message);
    }
  }

  await connection.end();

  console.log('\n================================ CREDENTIALS ================================');
  console.table(summary);
  console.log('=============================================================================\n');
  console.log('You can now log in at: http://localhost:3000/admin/login');
}

seedUsers();
