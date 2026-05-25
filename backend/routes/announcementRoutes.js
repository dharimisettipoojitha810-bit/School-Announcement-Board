const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const announcementController = require('../controllers/announcementController');
const { protect } = require('../middlewares/authMiddleware');

// Configure multer storage
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.get('/feed', protect, announcementController.getFeed);
router.get('/calendar', protect, announcementController.getCalendar);
router.get('/archive', protect, announcementController.getArchive);
router.get('/bookmarks', protect, announcementController.getBookmarks);
router.get('/analytics', protect, announcementController.getAnalytics);

router.get('/:id', protect, announcementController.getDetails);
router.post('/', protect, upload.array('files', 5), announcementController.create);
router.put('/:id', protect, upload.array('files', 5), announcementController.update);
router.delete('/:id', protect, announcementController.delete);

router.post('/:id/sign', protect, announcementController.signConsent);
router.post('/:id/bookmark', protect, announcementController.toggleBookmark);

module.exports = router;
