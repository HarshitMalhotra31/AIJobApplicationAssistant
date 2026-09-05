import { Router } from 'express'
import { analyzeResumeWithAI } from '../services/aiService.js'

const router = Router()

router.post('/', async (req, res) => {
  const { resume, jobDescription } = req.body

  if (!resume || typeof resume !== 'string' || !resume.trim()) {
    return res.status(400).json({ error: 'Resume is required and must be text.' })
  }

  if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
    return res.status(400).json({ error: 'Job description is required and must be text.' })
  }

  if (resume.trim().length < 20) {
    return res.status(400).json({ error: 'Resume content is too short. Please provide a more detailed resume (at least 20 characters).' })
  }

  if (jobDescription.trim().length < 20) {
    return res.status(400).json({ error: 'Job description is too short. Please provide more details (at least 20 characters).' })
  }

  try {
    const result = await analyzeResumeWithAI(resume, jobDescription)
    res.json(result)
  } catch (err) {
    console.error('AI Error:', err)
    let errorMessage = err.message || 'AI analysis failed. Please try again.'

    // If err.message is a JSON string from Google's API, extract the nested message
    if (errorMessage.includes('"message":')) {
      try {
        const parsedError = JSON.parse(errorMessage)
        if (parsedError.error?.message) {
          errorMessage = parsedError.error.message
        }
      } catch {
        // use original error message
      }
    }

    res.status(500).json({ error: errorMessage })
  }
})

export default router
