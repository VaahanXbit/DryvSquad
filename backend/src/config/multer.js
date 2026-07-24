// backend/src/config/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '../../uploads');
const heroBannersDir = path.join(uploadsDir, 'hero-banners');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(heroBannersDir)) {
  fs.mkdirSync(heroBannersDir, { recursive: true });
}

// Configure storage for hero banner images
const heroBannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, heroBannersDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const ext = path.extname(file.originalname) || '.webp';
    const filename = `banner_${timestamp}_${random}${ext}`;
    cb(null, filename);
  }
});

// File filter for images only
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PNG, JPEG, JPG, and WEBP images are allowed'), false);
  }
};

// Multer upload instances
const uploadHeroBanner = multer({
  storage: heroBannerStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 6 * 1024 * 1024, // 6MB
  }
});

module.exports = {
  uploadHeroBanner,
  heroBannersDir,
};