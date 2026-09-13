const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` })
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('[error]', err)

  if (err.name === 'ValidationError' || err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message })
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate value, please try again' })
  }

  const statusCode = err.statusCode || 500
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  })
}

module.exports = { notFound, errorHandler }
