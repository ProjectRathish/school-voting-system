const rateLimit = require('express-rate-limit');

/**
 * Strict limiter for authentication endpoints.
 * Allows 10 login attempts per IP per 15 minutes.
 * Prevents brute-force password attacks.
 */
// Helper to extract real IP from standard proxy headers
const getClientIp = (req) => {
  return req.headers['cf-connecting-ip'] || 
         req.headers['x-real-ip'] || 
         (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : null) || 
         req.ip || 
         req.socket.remoteAddress;
};

/**
 * Strict limiter for authentication endpoints.
 * Keyed by user credentials (school_code + username) rather than IP.
 * This prevents a shared school Wi-Fi network from locking out the entire school.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const schoolCode = req.body?.school_code || '';
    const username = req.body?.username || req.body?.school_code || ''; // fallback to school_code if username not supplied (admin login)
    if (schoolCode && username) {
      return `auth_${schoolCode.toLowerCase()}_${username.toLowerCase()}`;
    }
    return getClientIp(req);
  },
  message: {
    message: 'Too many login attempts for this account. Please try again after 15 minutes.'
  }
});

/**
 * General API limiter applied to all routes.
 * Set to 5000 requests per minute to accommodate multiple voting terminals
 * polling the server simultaneously from the same school network.
 */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  message: {
    message: 'Too many requests from this IP. Please slow down.'
  }
});

module.exports = { authLimiter, generalLimiter };
