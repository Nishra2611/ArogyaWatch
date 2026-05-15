const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { authenticateToken } = require('../middleware/auth');

router.get('/center', authenticateToken, alertController.getCenterAlerts);
router.post('/resolve/:id', authenticateToken, alertController.resolveAlert);

module.exports = router;
