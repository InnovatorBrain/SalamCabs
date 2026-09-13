const path = require('path')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const routes = require('./routes')
const { notFound, errorHandler } = require('./middleware/errorHandler')

const app = express()

const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  }),
)
app.use(express.json())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Vehicle photos (both admin-uploaded and the default seeded ones) now live
// on Cloudinary — these two routes only remain to keep serving any older
// local image links created before that migration.
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')))
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')))

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
