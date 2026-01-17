const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { uploadImage } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/auth.middleware');

// Protect route - only authenticated users (owners/admins) can upload
router.use(protect);

// Single file upload, field name 'image'
router.post('/', upload.single('image'), uploadImage);

module.exports = router;
