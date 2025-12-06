// utils/helpers/responseHelpers.js
// Helper function to send success response
const sendSuccessResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  })
}

// Helper function to send error response
const sendErrorResponse = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  }

  // Include errors array if provided
  if (errors) {
    response.errors = errors
  }

  return res.status(statusCode).json(response)
}

// Helper function to send paginated response
const sendPaginatedResponse = (res, data, pagination, message = 'Data retrieved successfully') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
    count: data.length,
    timestamp: new Date().toISOString()
  })
}

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
  sendPaginatedResponse
}