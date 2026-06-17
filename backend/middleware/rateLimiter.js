const rateLimit = require('express-rate-limit');

/**
 * Strict limiter for authentication endpoints.
 * Allows 10 login attempts per IP per 15 minutes.
 * Prevents brute-force password attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

/**
 * General API limiter applied to all routes.
 * Allows 200 requests per IP per minute.
 * Prevents denial-of-service from single clients.
 */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP. Please slow down.'
  }
});

module.exports = { authLimiter, generalLimiter };
