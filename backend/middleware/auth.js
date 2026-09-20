import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/**
 * Strict authentication middleware:
 * Validates the JWT Bearer token and attaches req.user.
 * Rejects requests with 401 Unauthorized if token is missing or invalid.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const secret = process.env.JWT_SECRET || 'jobtracker_jwt_super_secret_dev_key_2026'
    const decoded = jwt.verify(token, secret)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' })
    }
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' })
  }
}

/**
 * Optional authentication middleware:
 * If a valid Bearer token is provided, attaches req.user.
 * If no token is provided, allows request to proceed with req.user = null.
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null
    return next()
  }

  const token = authHeader.split(' ')[1]
  try {
    const secret = process.env.JWT_SECRET || 'jobtracker_jwt_super_secret_dev_key_2026'
    const decoded = jwt.verify(token, secret)
    const user = await User.findById(decoded.id).select('-password')
    req.user = user || null
  } catch (err) {
    req.user = null
  }
  next()
}
