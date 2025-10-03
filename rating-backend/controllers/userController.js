const db = require('../config/database')
const bcrypt = require('bcryptjs')

// Get all stores with their ratings (including user's own rating)
exports.getStores = async (req, res) => {
  try {
    const userId = req.user.id

    const [stores] = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.address,
        COALESCE(AVG(r.rating), 0) as overallRating,
        ur.rating as userRating
      FROM users u
      LEFT JOIN ratings r ON u.id = r.store_id
      LEFT JOIN ratings ur ON u.id = ur.store_id AND ur.user_id = ?
      WHERE u.role = 'store'
      GROUP BY u.id, u.name, u.address, ur.rating
      ORDER BY u.name
    `, [userId])

    res.json(stores)
  } catch (error) {
    console.error('Error fetching stores:', error)
    res.status(500).json({ message: 'Error fetching stores' })
  }
}

// Submit rating for a store
exports.submitRating = async (req, res) => {
  try {
    const userId = req.user.id
    const { storeId } = req.params
    const { rating } = req.body

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    }

    // Check if store exists
    const [stores] = await db.query('SELECT id FROM users WHERE id = ? AND role = ?', [storeId, 'store'])
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' })
    }

    // Check if user already rated this store
    const [existingRating] = await db.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    )

    if (existingRating.length > 0) {
      return res.status(400).json({ message: 'You have already rated this store. Use update instead.' })
    }

    // Insert rating
    await db.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
      [userId, storeId, rating]
    )

    res.status(201).json({ message: 'Rating submitted successfully' })
  } catch (error) {
    console.error('Error submitting rating:', error)
    res.status(500).json({ message: 'Error submitting rating' })
  }
}

// Update rating for a store
exports.updateRating = async (req, res) => {
  try {
    const userId = req.user.id
    const { storeId } = req.params
    const { rating } = req.body

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    }

    // Update rating
    const [result] = await db.query(
      'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND store_id = ?',
      [rating, userId, storeId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Rating not found' })
    }

    res.json({ message: 'Rating updated successfully' })
  } catch (error) {
    console.error('Error updating rating:', error)
    res.status(500).json({ message: 'Error updating rating' })
  }
}

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id
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

    // Get current password from database
    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId])
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, users[0].password)
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId])

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Error changing password:', error)
    res.status(500).json({ message: 'Error changing password' })
  }
}
