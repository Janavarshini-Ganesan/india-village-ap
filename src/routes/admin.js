const express = require('express')
const router = express.Router()
const prisma = require('../utils/prisma')
const { requireAdmin } = require('../middleware/auth')
const { sendApprovalEmail, sendSuspensionEmail } = require('../utils/email')

// Apply admin auth to all routes
router.use(requireAdmin)

// GET /api/admin/stats — Dashboard summary
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      totalApiKeys,
      totalStates,
      totalDistricts,
      totalSubDistricts,
      totalVillages
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.apiKey.count({ where: { isActive: true } }),
      prisma.state.count(),
      prisma.district.count(),
      prisma.subDistrict.count(),
      prisma.village.count()
    ])

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers, pending: pendingUsers },
        apiKeys: { total: totalApiKeys },
        geography: {
          states: totalStates,
          districts: totalDistricts,
          subDistricts: totalSubDistricts,
          villages: totalVillages
        }
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/admin/users — List all users
router.get('/users', async (req, res) => {
  try {
    const { status, plan, search } = req.query

    const where = {}
    if (status === 'active') where.isActive = true
    if (status === 'pending') where.isActive = false
    if (plan) where.planType = plan
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        planType: true,
        isActive: true,
        createdAt: true,
        _count: { select: { apiKeys: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ success: true, count: users.length, data: users })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/admin/users/:id — Get single user
router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        email: true,
        name: true,
        planType: true,
        isActive: true,
        createdAt: true,
        apiKeys: {
          select: {
            id: true,
            key: true,
            isActive: true,
            createdAt: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Mask API keys
    user.apiKeys = user.apiKeys.map(k => ({
      ...k,
      key: k.key.substring(0, 6) + '****' + k.key.substring(k.key.length - 4)
    }))

    res.json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// PATCH /api/admin/users/:id/approve — Approve user
router.patch('/users/:id/approve', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: true }
    })
    // Send approval email
    sendApprovalEmail(user.email, user.name)
    res.json({ success: true, message: `${user.name} approved successfully` })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// PATCH /api/admin/users/:id/suspend — Suspend user
router.patch('/users/:id/suspend', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false }
    })
    // Send suspension email
    sendSuspensionEmail(user.email, user.name)
    res.json({ success: true, message: `${user.name} suspended successfully` })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// PATCH /api/admin/users/:id/plan — Change user plan
router.patch('/users/:id/plan', async (req, res) => {
  try {
    const { planType } = req.body
    const validPlans = ['free', 'premium', 'pro', 'unlimited']

    if (!validPlans.includes(planType)) {
      return res.status(400).json({ success: false, message: 'Invalid plan type' })
    }

    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { planType }
    })

    res.json({ success: true, message: `${user.name} plan updated to ${planType}` })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE /api/admin/users/:id — Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await prisma.apiKey.deleteMany({ where: { userId: parseInt(req.params.id) } })
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})


// GET /api/admin/keys/all — Admin sees all keys
router.get('/keys/all', async (req, res) => {
  try {
    const keys = await prisma.apiKey.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, planType: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    const maskedKeys = keys.map(k => ({
      ...k,
      key: k.key.substring(0, 6) + '****' + k.key.substring(k.key.length - 4),
      secretHash: undefined
    }))
    res.json({ success: true, count: maskedKeys.length, data: maskedKeys })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/admin/geography/states
router.get('/geography/states', async (req, res) => {
  try {
    const states = await prisma.state.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, code: true, name: true }
    })
    res.json({ success: true, data: states })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/admin/geography/districts?stateId=1
router.get('/geography/districts', async (req, res) => {
  try {
    const { stateId } = req.query
    const districts = await prisma.district.findMany({
      where: { stateId: parseInt(stateId) },
      orderBy: { name: 'asc' },
      select: { id: true, code: true, name: true }
    })
    res.json({ success: true, data: districts })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/admin/geography/subdistricts?districtId=1
router.get('/geography/subdistricts', async (req, res) => {
  try {
    const { districtId } = req.query
    const subdistricts = await prisma.subDistrict.findMany({
      where: { districtId: parseInt(districtId) },
      orderBy: { name: 'asc' },
      select: { id: true, code: true, name: true }
    })
    res.json({ success: true, data: subdistricts })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/admin/geography/villages?subDistrictId=1
router.get('/geography/villages', async (req, res) => {
  try {
    const { subDistrictId } = req.query
    const villages = await prisma.village.findMany({
      where: { subDistrictId: parseInt(subDistrictId) },
      orderBy: { name: 'asc' },
      select: { id: true, code: true, name: true }
    })
    res.json({ success: true, data: villages })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/admin/geography/search?q=Chennai
router.get('/geography/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.length < 2) {
      return res.status(400).json({ success: false, message: 'Query too short' })
    }
    const villages = await prisma.village.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      take: 20,
      select: {
        id: true, code: true, name: true,
        subDistrict: {
          select: {
            name: true,
            district: { select: { name: true, state: { select: { name: true } } } }
          }
        }
      }
    })
    res.json({ success: true, data: villages })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/admin/logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await prisma.apiLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        apiKey: {
          select: {
            key: true,
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    })

    const formatted = logs.map(log => ({
      id: log.id,
      endpoint: log.endpoint,
      responseTime: log.responseTime,
      statusCode: log.statusCode,
      createdAt: log.createdAt,
      apiKey: log.apiKey.key.substring(0, 6) + '****' + log.apiKey.key.substring(log.apiKey.key.length - 4),
      user: log.apiKey.user.name,
      email: log.apiKey.user.email
    }))

    // Summary stats
    const total = logs.length
    const success = logs.filter(l => l.statusCode >= 200 && l.statusCode < 300).length
    const rateLimited = logs.filter(l => l.statusCode === 429).length
    const errors = logs.filter(l => l.statusCode >= 400 && l.statusCode !== 429).length
    const avgTime = logs.length > 0 ? Math.round(logs.reduce((a, b) => a + b.responseTime, 0) / logs.length) : 0

    res.json({
      success: true,
      stats: { total, success, rateLimited, errors, avgTime },
      data: formatted
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/admin/users/:id/states — get user state access
router.get('/users/:id/states', async (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    const access = await prisma.userStateAccess.findMany({
      where: { userId },
      include: { state: { select: { id: true, name: true, code: true } } }
    })
    const allStates = await prisma.state.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true }
    })
    res.json({
      success: true,
      data: {
        granted: access.map(a => a.state),
        all: allStates
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/admin/users/:id/states — grant state access
router.post('/users/:id/states', async (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    const { stateIds } = req.body // array of state IDs

    // Delete existing access
    await prisma.userStateAccess.deleteMany({ where: { userId } })

    // Grant new access
    if (stateIds && stateIds.length > 0) {
      await prisma.userStateAccess.createMany({
        data: stateIds.map(stateId => ({ userId, stateId }))
      })
    }

    res.json({ success: true, message: 'State access updated successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/admin/users/:id/states/all — grant all states
router.post('/users/:id/states/all', async (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    const allStates = await prisma.state.findMany({ select: { id: true } })

    await prisma.userStateAccess.deleteMany({ where: { userId } })
    await prisma.userStateAccess.createMany({
      data: allStates.map(s => ({ userId, stateId: s.id }))
    })

    res.json({ success: true, message: 'Full India access granted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})


module.exports = router