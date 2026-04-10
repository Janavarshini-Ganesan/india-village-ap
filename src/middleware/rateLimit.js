const { Redis } = require('@upstash/redis')

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Plan limits
const PLAN_LIMITS = {
  free: 5000,
  premium: 50000,
  pro: 300000,
  unlimited: 1000000
}

// Burst limits per minute
const BURST_LIMITS = {
  free: 100,
  premium: 500,
  pro: 2000,
  unlimited: 5000
}

const rateLimit = async (req, res, next) => {
  try {
    const user = req.user
    const apiKey = req.apiKey

    if (!user || !apiKey) return next()

    const planType = user.planType || 'free'
    const dailyLimit = PLAN_LIMITS[planType]
    const burstLimit = BURST_LIMITS[planType]

    // Daily limit key
    const today = new Date().toISOString().split('T')[0]
    const dailyKey = `ratelimit:daily:${apiKey.id}:${today}`

    // Burst limit key (per minute)
    const minute = Math.floor(Date.now() / 60000)
    const burstKey = `ratelimit:burst:${apiKey.id}:${minute}`

    // Check and increment daily count
    const dailyCount = await redis.incr(dailyKey)
    if (dailyCount === 1) {
      await redis.expire(dailyKey, 86400) // 24 hours
    }

    // Check and increment burst count
    const burstCount = await redis.incr(burstKey)
    if (burstCount === 1) {
      await redis.expire(burstKey, 60) // 1 minute
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', dailyLimit)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, dailyLimit - dailyCount))
    res.setHeader('X-RateLimit-Plan', planType)

    // Check burst limit
    if (burstCount > burstLimit) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests per minute',
        error: 'RATE_LIMITED',
        retryAfter: 60
      })
    }

    // Check daily limit
    if (dailyCount > dailyLimit) {
      return res.status(429).json({
        success: false,
        message: 'Daily quota exceeded. Upgrade your plan for more requests.',
        error: 'RATE_LIMITED',
        limit: dailyLimit,
        plan: planType
      })
    }

    next()
  } catch (error) {
    // If Redis fails, don't block the request
    console.error('Rate limit error:', error)
    next()
  }
}

module.exports = { rateLimit }