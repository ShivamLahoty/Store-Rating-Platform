const bcrypt = require('bcryptjs')
const db = require('../config/database')

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Total users (excluding stores and admins)
    const [userCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'")
    
    // Total stores
    const [storeCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'store'")
    
    // Total ratings
    const [ratingCount] = await db.query('SELECT COUNT(*) as count FROM ratings')

    res.json({
      totalUsers: userCount[0].count,
      totalStores: storeCount[0].count,
      totalRatings: ratingCount[0].count
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ message: 'Error fetching dashboard statistics' })
  }
}

// Add new user (admin, user, or store)
exports.addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body

    // Validate input
    if (!name || !email || !password || !address || !role) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Validate name length
    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: 'Name must be between 20-60 characters' })
    }

    // Validate password
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be 8-16 characters with at least one uppercase letter and one special character' 
      })
    }

    // Validate address
    if (address.length > 400) {
      return res.status(400).json({ message: 'Address must not exceed 400 characters' })
    }

    // Validate role
    if (!['admin', 'user', 'store'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' })
    }

    // Check if user exists
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email])
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user
    await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    )

    res.status(201).json({ message: 'User added successfully' })
  } catch (error) {
    console.error('Error adding user:', error)
    res.status(500).json({ message: 'Error adding user' })
  }
}

// Get all stores with average ratings
exports.getStores = async (req, res) => {
  try {
    const [stores] = await db.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address,
        COALESCE(AVG(r.rating), 0) as rating
      FROM users u
      LEFT JOIN ratings r ON u.id = r.store_id
      WHERE u.role = 'store'
      GROUP BY u.id, u.name, u.email, u.address
      ORDER BY u.name
    `)

    res.json(stores)
  } catch (error) {
    console.error('Error fetching stores:', error)
    res.status(500).json({ message: 'Error fetching stores' })
  }
}

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, name, email, address, role, created_at
      FROM users
      ORDER BY created_at DESC
    `)

    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ message: 'Error fetching users' })
  }
}

// Get user details by ID
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params

    const [users] = await db.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(users[0])
  } catch (error) {
    console.error('Error fetching user details:', error)
    res.status(500).json({ message: 'Error fetching user details' })
  }
}
