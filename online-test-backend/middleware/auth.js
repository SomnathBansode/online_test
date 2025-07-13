const jwt = require('jsonwebtoken');
const Session = require('../models/Session');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check session exists
    const session = await Session.findOne({ 
      userId: decoded.userId,
      token
    });
    
    if (!session) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      return res.status(401).json({ 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED' 
      });
    }

    // Attach user to request
    req.user = decoded;
    req.session = session;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ 
      message: error.name === 'TokenExpiredError' 
        ? 'Token expired' 
        : 'Invalid token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        console.error(`User ${req.user.userId} is not an admin`);
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};
// Add refresh token verification
const verifyRefreshToken = async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

module.exports = { authMiddleware, adminMiddleware,verifyRefreshToken };
