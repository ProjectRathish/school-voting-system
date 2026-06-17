const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// Public routes — no auth required
router.post('/order', registrationController.createOrder);
router.post('/verify', registrationController.verifyAndActivate);

module.exports = router;
