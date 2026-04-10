const express = require('express')
const router = express.Router()
const prisma = require('../utils/prisma')
const { requireApiKey } = require('../middleware/auth')
const { rateLimit } = require('../middleware/rateLimit')

// Apply API key auth + rate limiting to all routes
router.use(requireApiKey)
router.use(rateLimit)

// GET /api/v1/states
router.get('/states', async (req, res) => {
  try {
    const states = await prisma.state.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, code: true, name: true }
    })
    res.json({ success: true, count: states.length, data: states })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/v1/districts?stateId=1
router.get('/districts', async (req, res) => {
  try {
    const { stateId } = req.query
    if (!stateId) {
      return res.status(400).json({ success: false, message: 'stateId is required' })
    }
    const districts = await prisma.district.findMany({
      where: { stateId: parseInt(stateId) },
      orderBy: { name: 'asc' },
      select: { id: true, code: true, name: true, stateId: true }
    })
    res.json({ success: true, count: districts.length, data: districts })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/v1/subdistricts?districtId=1
router.get('/subdistricts', async (req, res) => {
  try {
    const { districtId } = req.query
    if (!districtId) {
      return res.status(400).json({ success: false, message: 'districtId is required' })
    }
    const subdistricts = await prisma.subDistrict.findMany({
      where: { districtId: parseInt(districtId) },
      orderBy: { name: 'asc' },
      select: { id: true, code: true, name: true, districtId: true }
    })
    res.json({ success: true, count: subdistricts.length, data: subdistricts })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/v1/villages?subDistrictId=1
router.get('/villages', async (req, res) => {
  try {
    const { subDistrictId } = req.query
    if (!subDistrictId) {
      return res.status(400).json({ success: false, message: 'subDistrictId is required' })
    }
    const villages = await prisma.village.findMany({
      where: { subDistrictId: parseInt(subDistrictId) },
      orderBy: { name: 'asc' },
      select: { id: true, code: true, name: true, subDistrictId: true }
    })
    res.json({ success: true, count: villages.length, data: villages })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/v1/villages/search?q=Chennai
router.get('/villages/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.length < 2) {
      return res.status(400).json({ success: false, message: 'Query must be at least 2 characters' })
    }
    const villages = await prisma.village.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      take: 20,
      select: {
        id: true,
        code: true,
        name: true,
        subDistrict: {
          select: {
            id: true,
            name: true,
            district: {
              select: {
                id: true,
                name: true,
                state: { select: { id: true, name: true } }
              }
            }
          }
        }
      }
    })
    res.json({ success: true, count: villages.length, data: villages })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/v1/hierarchy?villageId=1
router.get('/hierarchy', async (req, res) => {
  try {
    const { villageId } = req.query
    if (!villageId) {
      return res.status(400).json({ success: false, message: 'villageId is required' })
    }
    const village = await prisma.village.findUnique({
      where: { id: parseInt(villageId) },
      select: {
        id: true,
        code: true,
        name: true,
        subDistrict: {
          select: {
            id: true,
            code: true,
            name: true,
            district: {
              select: {
                id: true,
                code: true,
                name: true,
                state: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                    country: { select: { id: true, name: true, code: true } }
                  }
                }
              }
            }
          }
        }
      }
    })
    if (!village) {
      return res.status(404).json({ success: false, message: 'Village not found' })
    }
    const address = `${village.name}, ${village.subDistrict.name}, ${village.subDistrict.district.name}, ${village.subDistrict.district.state.name}, India`
    res.json({ success: true, data: { village, formattedAddress: address } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router