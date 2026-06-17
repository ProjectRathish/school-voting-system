const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const auditController = require('../controllers/auditController');

// All audit routes require school admin authentication
router.use(requireAuth);
router.use(requireRole('SCHOOL_ADMIN'));

router.get('/', auditController.getLogs);
router.get('/actions', auditController.getActionTypes);

module.exports = router;
