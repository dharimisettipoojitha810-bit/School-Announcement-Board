const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, categoryController.getAll);
router.post('/', protect, categoryController.create);
router.put('/:id', protect, categoryController.update);
router.delete('/:id', protect, categoryController.delete);

module.exports = router;
