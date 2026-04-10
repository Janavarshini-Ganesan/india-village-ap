const crypto = require('crypto')
const bcrypt = require('bcryptjs')

// Generate API Key: ak_[32 hex chars]
const generateApiKey = () => {
  return 'ak_' + crypto.randomBytes(16).toString('hex')
}

// Generate API Secret: as_[32 hex chars]
const generateApiSecret = () => {
  return 'as_' + crypto.randomBytes(16).toString('hex')
}

// Hash secret for storage
const hashSecret = async (secret) => {
  return await bcrypt.hash(secret, 12)
}

// Verify secret against hash
const verifySecret = async (secret, hash) => {
  return await bcrypt.compare(secret, hash)
}

module.exports = {
  generateApiKey,
  generateApiSecret,
  hashSecret,
  verifySecret
}