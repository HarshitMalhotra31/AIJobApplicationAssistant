import { Router } from 'express'
import Analysis from '../models/Analysis.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

/**
 * GET /api/dashboard
 * Aggregates analyses in MongoDB into summary statistics, scoped by user.
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.json({
        totalAnalyses: 0,
        avgMatchScore: 0,
        minScore: 0,
        maxScore: 0,
        recommendations: { apply: 0, consider: 0, skip: 0 },
        topMissingSkills: [],
        topMatchedSkills: [],
        recentAnalyses: [],
      })
    }

    const matchFilter = { userId: req.user._id }

    const totalAnalyses = await Analysis.countDocuments(matchFilter)

    if (totalAnalyses === 0) {
      return res.json({
        totalAnalyses: 0,
        avgMatchScore: 0,
        minScore: 0,
        maxScore: 0,
        recommendations: { apply: 0, consider: 0, skip: 0 },
        topMissingSkills: [],
        topMatchedSkills: [],
        recentAnalyses: [],
      })
    }

    // 1. Average score & recommendations breakdown
    const scorePipeline = []
    if (Object.keys(matchFilter).length > 0) {
      scorePipeline.push({ $match: matchFilter })
    }
    scorePipeline.push({
      $group: {
        _id: null,
        avgScore: { $avg: '$matchScore' },
        minScore: { $min: '$matchScore' },
        maxScore: { $max: '$matchScore' },
        applyCount: {
          $sum: { $cond: [{ $eq: ['$recommendation', 'APPLY'] }, 1, 0] },
        },
        considerCount: {
          $sum: { $cond: [{ $eq: ['$recommendation', 'CONSIDER'] }, 1, 0] },
        },
        skipCount: {
          $sum: { $cond: [{ $eq: ['$recommendation', 'SKIP'] }, 1, 0] },
        },
      },
    })

    const scoreStats = await Analysis.aggregate(scorePipeline)
    const stats = scoreStats[0] || {}

    // 2. Most frequent missing skills
    const missingPipeline = []
    if (Object.keys(matchFilter).length > 0) {
      missingPipeline.push({ $match: matchFilter })
    }
    missingPipeline.push(
      { $unwind: '$missingSkills' },
      {
        $group: {
          _id: '$missingSkills',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 }
    )
    const missingSkillsAgg = await Analysis.aggregate(missingPipeline)

    const topMissingSkills = missingSkillsAgg.map((item) => ({
      skill: item._id,
      count: item.count,
      percentage: Math.round((item.count / totalAnalyses) * 100),
    }))

    // 3. Most frequent matched skills
    const matchedPipeline = []
    if (Object.keys(matchFilter).length > 0) {
      matchedPipeline.push({ $match: matchFilter })
    }
    matchedPipeline.push(
      { $unwind: '$matchedSkills' },
      {
        $group: {
          _id: '$matchedSkills.skill',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 }
    )
    const matchedSkillsAgg = await Analysis.aggregate(matchedPipeline)

    const topMatchedSkills = matchedSkillsAgg.map((item) => ({
      skill: item._id,
      count: item.count,
      percentage: Math.round((item.count / totalAnalyses) * 100),
    }))

    // 4. Recent 5 analyses
    const recentAnalyses = await Analysis.find(
      matchFilter,
      'jobTitle companyName matchScore recommendation matchedSkills missingSkills createdAt'
    )
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({
      totalAnalyses,
      avgMatchScore: Math.round(stats.avgScore || 0),
      minScore: stats.minScore || 0,
      maxScore: stats.maxScore || 0,
      recommendations: {
        apply: stats.applyCount || 0,
        consider: stats.considerCount || 0,
        skip: stats.skipCount || 0,
      },
      topMissingSkills,
      topMatchedSkills,
      recentAnalyses,
    })
  } catch (err) {
    console.error('Dashboard aggregation error:', err)
    res.status(500).json({ error: 'Failed to compute dashboard analytics.' })
  }
})

export default router
