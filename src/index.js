require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./utils/swagger')
const geographyRoutes = require('./routes/geography')
const authRoutes = require('./routes/auth')
const apiKeyRoutes = require('./routes/apikeys')
const adminRoutes = require('./routes/admin')
const b2bRoutes = require('./routes/b2b')

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://india-village-api.vercel.app',
    'https://india-village-ap.vercel.app'
  ],
  credentials: true
}))
app.use(express.json())

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { background: #1e1b4b; }',
  customSiteTitle: 'India Village API Docs'
}))

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'India Village API is running!',
    version: '1.0.0',
    docs: '/api/docs'
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/keys', apiKeyRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/v1', geographyRoutes)
app.use('/api/b2b', b2bRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Swagger docs: http://localhost:${PORT}/api/docs`)
})

module.exports = app