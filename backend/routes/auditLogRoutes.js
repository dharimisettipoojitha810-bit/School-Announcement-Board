const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, auditLogController.getAllLogs);

module.exports = router;
