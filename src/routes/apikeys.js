const express = require('express')
const router = express.Router()
const prisma = require('../utils/prisma')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const { generateApiKey, generateApiSecret, hashSecret } = require('../utils/apiKey')

// POST /api/keys/generate — B2B user generates their own key
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { name } = req.body
    if (!name) {
      return res.status(400).json({ success: false, message: 'Key name is required' })
    }

    // Check active keys count (max 5)
    const activeKeys = await prisma.apiKey.count({
      where: { userId: req.user.id, isActive: true }
    })
    if (activeKeys >= 5) {
      return res.status(400).json({ success: false, message: 'Maximum 5 active keys allowed' })
    }

    const key = generateApiKey()
    const secret = generateApiSecret()
    const secretHash = await hashSecret(secret)

    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        secretHash,
        userId: req.user.id,
        isActive: true
      }
    })

    res.status(201).json({
      success: true,
      message: 'API key generated. Save your secret — it will not be shown again!',
      data: {
        id: apiKey.id,
        key: apiKey.key,
        secret: secret, // shown only once
        createdAt: apiKey.createdAt
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/keys — Get all keys for logged in user
router.get('/', requireAuth, async (req, res) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        key: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Mask the key for display
    const maskedKeys = keys.map(k => ({
      ...k,
      key: k.key.substring(0, 6) + '****' + k.key.substring(k.key.length - 4)
    }))

    res.json({ success: true, count: maskedKeys.length, data: maskedKeys })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE /api/keys/:id — Revoke a key
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const keyId = parseInt(req.params.id)

    const keyRecord = await prisma.apiKey.findUnique({
      where: { id: keyId }
    })

    if (!keyRecord) {
      return res.status(404).json({ success: false, message: 'Key not found' })
    }

    if (keyRecord.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false }
    })

    res.json({ success: true, message: 'API key revoked successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/keys/admin/all — Admin sees all keys
router.get('/admin/all', requireAdmin, async (req, res) => {
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

module.exports = router