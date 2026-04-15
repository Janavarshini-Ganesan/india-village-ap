const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const prisma = require('../utils/prisma')
const { generateToken } = require('../utils/jwt')
const { requireAuth } = require('../middleware/auth')
const { sendWelcomeEmail } = require('../utils/email')
const { email, password, name, planType } = req.body

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Email, password and name are required' })
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        planType: planType || 'free',
        isActive: false // needs admin approval
      }
    })

    // Send welcome email
    sendWelcomeEmail(user.email, user.name)

    res.status(201).json({
      success: true,
      message: 'Registration successful! Awaiting admin approval.',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        planType: user.planType
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    // Check admin login
    if (email === process.env.ADMIN_EMAIL) {
      const isValidAdmin = password === process.env.ADMIN_PASSWORD
      if (!isValidAdmin) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' })
      }
      const token = generateToken({ email, role: 'admin' })
      return res.json({
        success: true,
        data: { token, role: 'admin', name: 'Admin' }
      })
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    // Check if approved
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account pending approval' })
    }

    const token = generateToken({ id: user.id, email: user.email, role: 'user' })

    res.json({
      success: true,
      data: {
        token,
        role: 'user',
        name: user.name,
        planType: user.planType
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.json({ success: true, data: { role: 'admin', email: req.user.email } })
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, planType: true, isActive: true, createdAt: true }
    })
    res.json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router