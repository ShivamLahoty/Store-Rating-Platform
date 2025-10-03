const db = require('../config/database')
const bcrypt = require('bcryptjs')

// Get store dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const storeId = req.user.id

    // Get average rating
    const [avgRating] = await db.query(
      'SELECT COALESCE(AVG(rating), 0) as averageRating FROM ratings WHERE store_id = ?',
      [storeId]
    )

    // Get total ratings count
    const [ratingCount] = await db.query(
      'SELECT COUNT(*) as totalRatings FROM ratings WHERE store_id = ?',
      [storeId]
    )

    // Get all ratings with user details
    const [ratings] = await db.query(`
      SELECT 
        u.name as userName,
        u.email as userEmail,
        r.rating,
        r.created_at as createdAt
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [storeId])

    res.json({
      averageRating: avgRating[0].averageRating,
      totalRatings: ratingCount[0].totalRatings,
      ratings: ratings
    })
  } catch (error) {
    console.error('Error fetching store dashboard:', error)
    res.status(500).json({ message: 'Error fetching store dashboard' })
  }
}

// Get all ratings for store
exports.getRatings = async (req, res) => {
  try {
    const storeId = req.user.id

    const [ratings] = await db.query(`
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        u.name as userName,
        u.email as userEmail
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [storeId])

    res.json(ratings)
  } catch (error) {
    console.error('Error fetching ratings:', error)
    res.status(500).json({ message: 'Error fetching ratings' })
  }
}

// Change password
exports.changePassword = async (req, res) => {
  try {
    const storeId = req.user.id
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' })
    }

    // Validate new password
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: 'Password must be 8-16 characters with at least one uppercase letter and one special character' 
      })
    }

    // Get current password
    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [storeId])
    if (users.length === 0) {
      return res.status(404).json({ message: 'Store not found' })
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, users[0].password)
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, storeId])

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Error changing password:', error)
    res.status(500).json({ message: 'Error changing password' })
  }
}
