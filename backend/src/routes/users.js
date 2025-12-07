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

// Profile routes - current user
router
  .route('/profile')
  .get((req, res, next) => {
    req.params.id = req.user.id
    next()
  }, getUser)
  .put((req, res, next) => {
    req.params.id = req.user.id
    next()
  }, updateUser)

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(authorize('admin'), deleteUser)

module.exports = router