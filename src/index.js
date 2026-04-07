require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const geographyRoutes = require('./routes/geography')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'India Village API is running!',
    version: '1.0.0'
  })
})

// Routes
app.use('/api/v1', geographyRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app