const { Redis } = require('@upstash/redis')
const prisma = require('../utils/prisma')

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const PLAN_LIMITS = {
  free: 5000,
  premium: 50000,
  pro: 300000,
  unlimited: 1000000
}

const BURST_LIMITS = {
  free: 100,
  premium: 500,
  pro: 2000,
  unlimited: 5000
}

const rateLimit = async (req, res, next) => {
  const startTime = Date.now()

  try {
    const user = req.user
    const apiKey = req.apiKey

    if (!user || !apiKey) return next()

    const planType = user.planType || 'free'
    const dailyLimit = PLAN_LIMITS[planType]
    const burstLimit = BURST_LIMITS[planType]

    const today = new Date().toISOString().split('T')[0]
    const dailyKey = `ratelimit:daily:${apiKey.id}:${today}`
    const minute = Math.floor(Date.now() / 60000)
    const burstKey = `ratelimit:burst:${apiKey.id}:${minute}`

    const dailyCount = await redis.incr(dailyKey)
    if (dailyCount === 1) await redis.expire(dailyKey, 86400)

    const burstCount = await redis.incr(burstKey)
    if (burstCount === 1) await redis.expire(burstKey, 60)

    res.setHeader('X-RateLimit-Limit', dailyLimit)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, dailyLimit - dailyCount))
    res.setHeader('X-RateLimit-Plan', planType)

    // Intercept response to log it
    const originalJson = res.json.bind(res)
    res.json = (body) => {
      const responseTime = Date.now() - startTime
      // Log asynchronously — don't block response
      prisma.apiLog.create({
        data: {
          apiKeyId: apiKey.id,
          userId: user.id,
          endpoint: req.originalUrl,
          responseTime,
          statusCode: res.statusCode || 200,
        }
      }).catch(err => console.error('Log error:', err))
      return originalJson(body)
    }

    if (burstCount > burstLimit) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests per minute',
        error: 'RATE_LIMITED',
        retryAfter: 60
      })
    }

    if (dailyCount > dailyLimit) {
      return res.status(429).json({
        success: false,
        message: 'Daily quota exceeded. Upgrade your plan.',
        error: 'RATE_LIMITED',
        limit: dailyLimit,
        plan: planType
      })
    }

    next()
  } catch (error) {
    console.error('Rate limit error:', error)
    next()
  }
}

module.exports = { rateLimit }