// controllers/categoryController.js
const Category = require('../models/Category')
const Service = require('../models/Service')
const { sendSuccessResponse, sendErrorResponse } = require('../utils/helpers/responseHelpers')

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name slug')
      .populate('subcategories', 'name slug serviceCount')
      .sort({ name: 1 })

    // Update service counts
    await updateServiceCounts()

    res.status(200).json({
      success: true,
      data: categories,
      count: categories.length
    })
  } catch (error) {
    console.error('Get categories error:', error)
    sendErrorResponse(res, 'Failed to fetch categories', 500)
  }
}

// @desc    Get category tree (hierarchical structure)
// @route   GET /api/categories/tree
// @access  Public
exports.getCategoryTree = async (req, res) => {
  try {
    // Get root categories (no parent)
    const rootCategories = await Category.find({ 
      isActive: true, 
      parentCategory: { $exists: false } 
    }).populate({
      path: 'subcategories',
      match: { isActive: true },
      select: 'name slug serviceCount description',
      populate: {
        path: 'subcategories',
        match: { isActive: true },
        select: 'name slug serviceCount description'
      }
    }).sort({ name: 1 })

    res.status(200).json({
      success: true,
      data: rootCategories,
      count: rootCategories.length
    })
  } catch (error) {
    console.error('Get category tree error:', error)
    sendErrorResponse(res, 'Failed to fetch category tree', 500)
  }
}

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name slug')
      .populate('subcategories', 'name slug serviceCount description')

    if (!category || !category.isActive) {
      return sendErrorResponse(res, 'Category not found', 404)
    }

    // Get services in this category
    const services = await Service.find({ 
      category: req.params.id, 
      isActive: true, 
      isApproved: true 
    })
      .populate('provider', 'firstName lastName providerInfo.rating providerInfo.reviewCount')
      .limit(10)

    const response = {
      ...category.toObject(),
      services
    }

    sendSuccessResponse(res, response, 'Category retrieved successfully')
  } catch (error) {
    console.error('Get category error:', error)
    
    if (error.name === 'CastError') {
      return sendErrorResponse(res, 'Category not found', 404)
    }
    
    sendErrorResponse(res, 'Failed to get category', 500)
  }
}

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parentCategory } = req.body

    // Check if category name already exists
    const existingCategory = await Category.findOne({ name: name.trim() })
    if (existingCategory) {
      return sendErrorResponse(res, 'Category with this name already exists', 409)
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-')

    const categoryData = {
      name: name.trim(),
      slug,
      description: description?.trim()
    }

    // If parent category specified, validate it exists
    if (parentCategory) {
      const parent = await Category.findById(parentCategory)
      if (!parent) {
        return sendErrorResponse(res, 'Parent category not found', 404)
      }
      categoryData.parentCategory = parentCategory
    }

    const category = await Category.create(categoryData)

    // If this is a subcategory, add it to parent's subcategories
    if (parentCategory) {
      await Category.findByIdAndUpdate(parentCategory, {
        $push: { subcategories: category._id }
      })
    }

    await category.populate('parentCategory', 'name slug')

    sendSuccessResponse(res, category, 'Category created successfully', 201)
  } catch (error) {
    console.error('Create category error:', error)
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ')
      return sendErrorResponse(res, message, 400)
    }
    
    sendErrorResponse(res, 'Failed to create category', 500)
  }
}

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id)

    if (!category) {
      return sendErrorResponse(res, 'Category not found', 404)
    }

    const { name, description } = req.body

    // If name is being updated, check for duplicates
    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: name.trim(),
        _id: { $ne: req.params.id }
      })
      if (existingCategory) {
        return sendErrorResponse(res, 'Category with this name already exists', 409)
      }
      
      // Update slug if name changed
      req.body.slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-')
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: name?.trim(), description: description?.trim(), slug: req.body.slug },
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name slug')

    sendSuccessResponse(res, category, 'Category updated successfully')
  } catch (error) {
    console.error('Update category error:', error)
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ')
      return sendErrorResponse(res, message, 400)
    }
    
    if (error.name === 'CastError') {
      return sendErrorResponse(res, 'Category not found', 404)
    }
    
    sendErrorResponse(res, 'Failed to update category', 500)
  }
}

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return sendErrorResponse(res, 'Category not found', 404)
    }

    // Check if category has services
    const serviceCount = await Service.countDocuments({ category: req.params.id, isActive: true })
    if (serviceCount > 0) {
      return sendErrorResponse(res, 'Cannot delete category that has active services', 400)
    }

    // Check if category has subcategories
    if (category.subcategories && category.subcategories.length > 0) {
      return sendErrorResponse(res, 'Cannot delete category that has subcategories', 400)
    }

    // Remove from parent category's subcategories if applicable
    if (category.parentCategory) {
      await Category.findByIdAndUpdate(category.parentCategory, {
        $pull: { subcategories: req.params.id }
      })
    }

    // Soft delete
    await Category.findByIdAndUpdate(req.params.id, { isActive: false })

    sendSuccessResponse(res, null, 'Category deleted successfully')
  } catch (error) {
    console.error('Delete category error:', error)
    
    if (error.name === 'CastError') {
      return sendErrorResponse(res, 'Category not found', 404)
    }
    
    sendErrorResponse(res, 'Failed to delete category', 500)
  }
}

// @desc    Get popular categories (by service count)
// @route   GET /api/categories/popular
// @access  Public
exports.getPopularCategories = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10

    await updateServiceCounts()

    const categories = await Category.find({ isActive: true })
      .sort({ serviceCount: -1 })
      .limit(limit)

    res.status(200).json({
      success: true,
      data: categories,
      count: categories.length
    })
  } catch (error) {
    console.error('Get popular categories error:', error)
    sendErrorResponse(res, 'Failed to fetch popular categories', 500)
  }
}

// @desc    Search categories
// @route   GET /api/categories/search
// @access  Public
exports.searchCategories = async (req, res) => {
  try {
    const { q } = req.query

    if (!q) {
      return sendErrorResponse(res, 'Search query is required', 400)
    }

    const categories = await Category.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }).populate('parentCategory', 'name slug')
      .limit(20)

    res.status(200).json({
      success: true,
      data: categories,
      count: categories.length
    })
  } catch (error) {
    console.error('Search categories error:', error)
    sendErrorResponse(res, 'Failed to search categories', 500)
  }
}

// Helper function to update service counts for all categories
const updateServiceCounts = async () => {
  try {
    const categories = await Category.find({ isActive: true })

    for (const category of categories) {
      const serviceCount = await Service.countDocuments({
        category: category._id,
        isActive: true,
        isApproved: true
      })

      await Category.findByIdAndUpdate(category._id, { serviceCount })
    }
  } catch (error) {
    console.error('Update service counts error:', error)
  }
}