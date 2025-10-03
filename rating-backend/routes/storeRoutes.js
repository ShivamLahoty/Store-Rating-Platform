const express = require('express')
const router = express.Router()
const storeController = require('../controllers/storeController')
const authenticateToken = require('../middleware/auth')
const validateRole = require('../middleware/validateRole')

// All store routes require authentication and store role
router.use(authenticateToken)
router.use(validateRole('store'))

router.get('/dashboard', storeController.getDashboard)
router.get('/ratings', storeController.getRatings)
router.put('/change-password', storeController.changePassword)

module.exports = router
