const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  addFavorite,
  removeFavorite,
  getFavorites
} = require('../controllers/favoritesController');

// All routes require authentication
router.use(protect);

router.post('/:restaurantId', addFavorite);
router.delete('/:restaurantId', removeFavorite);
router.get('/', getFavorites);

module.exports = router;
