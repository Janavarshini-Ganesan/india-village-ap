require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const geographyRoutes = require('./routes/geography')
const authRoutes = require('./routes/auth')
const apiKeyRoutes = require('./routes/apikeys')
const adminRoutes = require('./routes/admin')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://india-village-api.vercel.app',
    'https://india-village-ap.vercel.app'
  ],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'India Village API is running!',
    version: '1.0.0'
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/keys', apiKeyRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/v1', geographyRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app