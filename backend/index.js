import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import analyzeRouter from './routes/analyze.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/analyze', analyzeRouter)

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'AI Job Assistant backend is running.' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
