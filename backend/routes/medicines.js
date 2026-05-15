const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Publicly readable for all logged in users (Staff need to see list to add stock)
router.get('/', authenticateToken, medicineController.getAllMedicines);

// Restricted actions (ADMIN Only)
router.post('/', authenticateToken, authorizeRoles('ADMIN'), medicineController.createMedicine);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), medicineController.updateMedicine);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), medicineController.deleteMedicine);

module.exports = router;
