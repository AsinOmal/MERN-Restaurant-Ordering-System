const path = require('path');

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private (Owner/Admin)
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Return the path that can be served statically
        // We will serve the 'uploads' folder at /uploads
        const imageUrl = `/uploads/${req.file.filename}`;

        res.status(200).json({
            success: true,
            data: { url: imageUrl }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
