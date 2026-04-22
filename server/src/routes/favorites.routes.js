const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/protect.middleware');
const {
  addFavorite,
  removeFavorite,
  getFavorites
} = require('../controllers/favoritesController');

router.use(protect);

router.post('/:restaurantId', addFavorite);
router.delete('/:restaurantId', removeFavorite);
router.get('/', getFavorites);

module.exports = router;
