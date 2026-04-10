const { verifyToken } = require('../utils/jwt')
const prisma = require('../utils/prisma')
const { verifySecret } = require('../utils/apiKey')

// Middleware: Protect dashboard routes with JWT
const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

// Middleware: Protect admin routes
const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' })
    }
    next()
  })
}

// Middleware: Protect API routes with API Key
const requireApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key']
    const apiSecret = req.headers['x-api-secret']

    if (!apiKey) {
      return res.status(401).json({ success: false, message: 'API key required' })
    }

    // Find API key in database
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    })

    if (!keyRecord || !keyRecord.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid or inactive API key' })
    }

    if (!keyRecord.user.isActive) {
      return res.status(403).json({ success: false, message: 'Account suspended' })
    }

    // Verify secret if provided
    if (apiSecret) {
      const isValidSecret = await verifySecret(apiSecret, keyRecord.secretHash)
      if (!isValidSecret) {
        return res.status(401).json({ success: false, message: 'Invalid API secret' })
      }
    }

    req.apiKey = keyRecord
    req.user = keyRecord.user
    next()
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { requireAuth, requireAdmin, requireApiKey }