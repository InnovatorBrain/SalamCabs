const mongoose = require('mongoose')

const connectDB = async () => {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to backend/.env')
  }

  mongoose.set('strictQuery', true)

  await mongoose.connect(uri)

  console.log(`[db] Connected to MongoDB -> ${mongoose.connection.name}`)

  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message)
  })

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected')
  })
}

module.exports = connectDB
