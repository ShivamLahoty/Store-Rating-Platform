const bcrypt = require('bcryptjs')
const db = require('./config/database')

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('Admin@123', 10)
    
    await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [
        'System Administrator Account',
        'admin@storerating.com',
        hashedPassword,
        'Admin Office, Main Street',
        'admin'
      ]
    )
    
    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@storerating.com')
    console.log('🔑 Password: Admin@123')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
    process.exit(1)
  }
}

createAdmin()
