require('dotenv').config()

const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 3000

const start = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`[server] Salam Cab API listening on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('[server] Failed to start:', error.message)
    process.exit(1)
  }
}

start()
