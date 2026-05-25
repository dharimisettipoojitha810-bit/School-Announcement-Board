const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getCurrentUser);
router.post('/import', protect, authController.bulkImport);
router.get('/users', protect, authController.getAllUsers);

module.exports = router;
