const express = require('express')
const router = express.Router()
const prisma = require('../utils/prisma')
const { requireAuth } = require('../middleware/auth')

// POST /api/b2b/upgrade-plan
router.post('/upgrade-plan', requireAuth, async (req, res) => {
  try {
    const { planType } = req.body
    const validPlans = ['free', 'premium', 'pro', 'unlimited']

    if (!validPlans.includes(planType)) {
      return res.status(400).json({ success: false, message: 'Invalid plan type' })
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { planType }
    })

    res.json({
      success: true,
      message: `Plan upgraded to ${planType} successfully`,
      data: { planType: user.planType }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/b2b/usage
router.get('/usage', requireAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]

    const logs = await prisma.apiLog.findMany({
      where: {
        userId: req.user.id,
        createdAt: {
          gte: new Date(today)
        }
      },
      select: { id: true, endpoint: true, statusCode: true, responseTime: true, createdAt: true }
    })

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { planType: true }
    })

    const planLimits = { free: 5000, premium: 50000, pro: 300000, unlimited: 1000000 }
    const limit = planLimits[user.planType]
    const used = logs.length
    const remaining = Math.max(0, limit - used)
    const percentage = Math.round((used / limit) * 100)

    res.json({
      success: true,
      data: {
        today: { used, remaining, limit, percentage },
        planType: user.planType,
        recentLogs: logs.slice(0, 10)
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router