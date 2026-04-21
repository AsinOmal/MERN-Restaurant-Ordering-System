const express = require('express');
const router = express.Router();
const { getReviews, createReview, updateReview, deleteReview } = require('../controllers/reviewController');
const { verifyAsgardeoToken } = require('../middleware/asgardeo.middleware');

router.route('/').get(getReviews).post(verifyAsgardeoToken, createReview);
router.route('/:id').put(verifyAsgardeoToken, updateReview).delete(verifyAsgardeoToken, deleteReview);

module.exports = router;
