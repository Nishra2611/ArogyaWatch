const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/center', authenticateToken, stockController.getCenterStock);
router.get('/global', authenticateToken, authorizeRoles('ADMIN'), stockController.getGlobalInventory);
router.get('/stats', authenticateToken, authorizeRoles('ADMIN'), stockController.getSystemStats);
router.get('/batches/:medicine_id', authenticateToken, stockController.getMedicineBatches);
router.post('/in', authenticateToken, authorizeRoles('STAFF'), stockController.addStockIn);
router.post('/out', authenticateToken, authorizeRoles('STAFF'), stockController.addStockOut);
router.get('/history', authenticateToken, stockController.getHistory);

module.exports = router;
