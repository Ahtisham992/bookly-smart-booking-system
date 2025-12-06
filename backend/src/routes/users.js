const express = require('express')
const { protect, authorize } = require('../middleware/auth')
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/userController')

const router = express.Router()

// All routes are protected and require authentication
router.use(protect)

router
  .route('/')
  .get(authorize('admin'), getUsers)

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser)

module.exports = router