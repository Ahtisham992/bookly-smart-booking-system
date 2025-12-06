// routes/categories.js
const express = require('express')
const {
  getCategories,
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getPopularCategories,
  searchCategories
} = require('../controllers/categoryController')

const { protect } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/roleAuth')
const { generalLimiter } = require('../middleware/rateLimiting')

const router = express.Router()

// Apply rate limiting
router.use(generalLimiter)

// Public routes
router.get('/', getCategories)
router.get('/tree', getCategoryTree)
router.get('/popular', getPopularCategories)
router.get('/search', searchCategories)
router.get('/:id', getCategory)

// Protected routes (Admin only)
router.use(protect)
router.use(requireAdmin)

router.post('/', createCategory)
router.put('/:id', updateCategory)
router.delete('/:id', deleteCategory)

module.exports = router
