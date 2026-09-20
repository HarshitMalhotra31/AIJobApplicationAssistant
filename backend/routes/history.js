import { Router } from 'express'
import Analysis from '../models/Analysis.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

/**
 * GET /api/history
 * Retrieves a list of past analyses sorted by newest first.
 * Scoped to authenticated user (or returns unassigned guest records if logged in as guest).
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    // If not logged in, guests have no saved server history
    if (!req.user) {
      return res.json([])
    }

    const filter = { userId: req.user._id }

    const history = await Analysis.find(
      filter,
      'jobTitle companyName matchScore recommendation matchedSkills missingSkills createdAt'
    ).sort({ createdAt: -1 })

    const summaries = history.map((item) => ({
      _id: item._id,
      jobTitle: item.jobTitle || 'Untitled Evaluation',
      companyName: item.companyName || '',
      matchScore: item.matchScore,
      recommendation: item.recommendation,
      matchedCount: item.matchedSkills?.length || 0,
      missingCount: item.missingSkills?.length || 0,
      createdAt: item.createdAt,
    }))

    res.json(summaries)
  } catch (err) {
    console.error('Error fetching history:', err)
    res.status(500).json({ error: 'Failed to retrieve analysis history.' })
  }
})

/**
 * GET /api/history/:id
 * Retrieves the full evaluation report for a specific past analysis.
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const filter = { _id: req.params.id }
    if (req.user) {
      filter.userId = req.user._id
    }

    const analysis = await Analysis.findOne(filter)
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis record not found.' })
    }
    res.json(analysis)
  } catch (err) {
    console.error('Error fetching analysis details:', err)
    res.status(500).json({ error: 'Failed to retrieve analysis details.' })
  }
})

/**
 * DELETE /api/history/:id
 * Deletes a past analysis by ID. Only the record owner can delete it.
 */
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required to delete records.' })
    }

    const filter = { _id: req.params.id, userId: req.user._id }

    const deleted = await Analysis.findOneAndDelete(filter)
    if (!deleted) {
      return res.status(404).json({ error: 'Analysis record not found.' })
    }
    res.json({ message: 'Analysis deleted successfully.', _id: req.params.id })
  } catch (err) {
    console.error('Error deleting analysis:', err)
    res.status(500).json({ error: 'Failed to delete analysis record.' })
  }
})

export default router
