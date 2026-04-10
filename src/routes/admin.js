const express = require('express')
const router = express.Router()
const prisma = require('../utils/prisma')
const { requireAdmin } = require('../middleware/auth')

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

module.exports = router