const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/:announcementId', protect, commentController.getByAnnouncement);
router.post('/', protect, commentController.create);
router.delete('/:id', protect, commentController.delete);

module.exports = router;
