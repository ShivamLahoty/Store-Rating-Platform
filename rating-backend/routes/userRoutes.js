const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authenticateToken = require('../middleware/auth')
const validateRole = require('../middleware/validateRole')

// All user routes require authentication and user role
router.use(authenticateToken)
router.use(validateRole('user'))

router.get('/stores', userController.getStores)
router.post('/stores/:storeId/rating', userController.submitRating)
router.put('/stores/:storeId/rating', userController.updateRating)
router.put('/change-password', userController.changePassword)

module.exports = router
