import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import analyzeRouter from './routes/analyze.js'
import historyRouter from './routes/history.js'
import dashboardRouter from './routes/dashboard.js'
import authRouter from './routes/auth.js'
import uploadRouter from './routes/upload.js'
import scrapeRouter from './routes/scrape.js'
import connectDB from './config/db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

// Middleware
app.use(cors())
app.use(express.json())

// Connect to MongoDB
connectDB()

// Routes
app.use('/api/auth', authRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/scrape', scrapeRouter)
app.use('/api/analyze', analyzeRouter)
app.use('/api/history', historyRouter)
app.use('/api/dashboard', dashboardRouter)

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'AI Job Assistant backend is running.' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

