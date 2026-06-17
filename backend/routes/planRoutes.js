const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/public', planController.getPublicPlans);
router.get('/', requireAuth, requireRole('SUPER_ADMIN'), planController.getPlans);
router.post('/', requireAuth, requireRole('SUPER_ADMIN'), planController.createPlan);
router.put('/:id', requireAuth, requireRole('SUPER_ADMIN'), planController.updatePlan);
router.delete('/:id', requireAuth, requireRole('SUPER_ADMIN'), planController.deletePlan);

module.exports = router;
