// middleware/uploadMiddleware.js
const multer = require('multer')
const path = require('path')
const { sendErrorResponse } = require('../utils/helpers/responseHelpers')

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/services/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'), false)
  }
}

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
})

// Single file upload
exports.uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName)
    
    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return sendErrorResponse(res, 'File too large. Maximum size is 5MB', 400)
        }
        return sendErrorResponse(res, `Upload error: ${err.message}`, 400)
      } else if (err) {
        return sendErrorResponse(res, err.message, 400)
      }
      next()
    })
  }
}

// Multiple files upload
exports.uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount)
    
    multipleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return sendErrorResponse(res, 'File too large. Maximum size is 5MB', 400)
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return sendErrorResponse(res, `Too many files. Maximum is ${maxCount}`, 400)
        }
        return sendErrorResponse(res, `Upload error: ${err.message}`, 400)
      } else if (err) {
        return sendErrorResponse(res, err.message, 400)
      }
      next()
    })
  }
}