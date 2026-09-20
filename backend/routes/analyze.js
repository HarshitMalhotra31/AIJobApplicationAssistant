import { Router } from 'express'
import { analyzeResumeWithAI } from '../services/aiService.js'
import Analysis from '../models/Analysis.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

router.post('/', optionalAuth, async (req, res) => {
  const { resume, jobDescription, jobTitle = '', companyName = '' } = req.body

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

    // Save evaluation to MongoDB automatically if authenticated user
    let savedDoc = null
    if (req.user) {
      try {
        let inferredTitle = jobTitle
        if (!inferredTitle) {
          const titleMatch = jobDescription.match(/(?:job title|role|position):\s*([^\n\r]+)/i)
          if (titleMatch && titleMatch[1]) {
            inferredTitle = titleMatch[1].trim()
          }
        }

        savedDoc = await Analysis.create({
          userId: req.user._id,
          jobTitle: inferredTitle,
          companyName,
          resumeText: resume,
          jobDescriptionText: jobDescription,
          matchScore: result.matchScore,
          recommendation: result.recommendation,
          matchedSkills: result.matchedSkills,
          missingSkills: result.missingSkills,
          mustHave: result.mustHave,
          niceToHave: result.niceToHave,
          explanation: result.explanation,
          suggestions: result.suggestions,
        })
        console.log(`Saved analysis to MongoDB with ID: ${savedDoc._id}`)
      } catch (dbError) {
        console.warn('Could not save analysis to MongoDB:', dbError.message)
      }
    }

    res.json({
      ...result,
      _id: savedDoc?._id,
      createdAt: savedDoc?.createdAt,
    })
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
