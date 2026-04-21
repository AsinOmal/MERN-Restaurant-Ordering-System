const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { uploadImage } = require('../controllers/uploadController');
const { verifyAsgardeoToken } = require('../middleware/asgardeo.middleware');

router.use(verifyAsgardeoToken);

// Single file upload, field name 'image'
router.post('/', upload.single('image'), uploadImage);

module.exports = router;
