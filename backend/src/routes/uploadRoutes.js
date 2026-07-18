const express = require('express');
const multer = require('multer');
const { protect, admin } = require('../middleware/auth');
const { uploadImage } = require('../controllers/uploadController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const isImage = Boolean(file.mimetype && file.mimetype.startsWith('image/'));
    callback(isImage ? null : new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'), isImage);
  },
});

router.post('/image', protect, admin, upload.single('image'), uploadImage);

module.exports = router;
