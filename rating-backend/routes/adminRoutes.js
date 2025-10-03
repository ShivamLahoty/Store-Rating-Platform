const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const authenticateToken = require('../middleware/auth')
const validateRole = require('../middleware/validateRole')

// All admin routes require authentication and admin role
router.use(authenticateToken)
router.use(validateRole('admin'))

router.get('/stats', adminController.getDashboardStats)
router.post('/users', adminController.addUser)
router.get('/stores', adminController.getStores)
router.get('/users', adminController.getUsers)
router.get('/users/:userId', adminController.getUserDetails)

module.exports = router
