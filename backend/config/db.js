import mongoose from 'mongoose'

/**
 * Connects to MongoDB using the URI from environment variables.
 * Includes graceful connection event logging and error handling.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobtracker'

  try {
    const conn = await mongoose.connect(uri)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`)
    return conn
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    return null
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected.')
})

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected.')
})

export default connectDB
