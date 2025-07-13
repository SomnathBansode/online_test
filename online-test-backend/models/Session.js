const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Added for better query performance
  },
  token: {
    type: String,
    required: true,
    unique: true // Ensure token uniqueness
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '1d' } // Auto-delete after 1 day
  }
}, { 
  timestamps: true,
  statics: {
    async createSession(userId, token, refreshToken, req) {
      return this.create({
        userId,
        token,
        refreshToken,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
      });
    }
  }
});

module.exports = mongoose.model('Session', sessionSchema);