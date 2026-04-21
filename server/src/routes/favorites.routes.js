const express = require('express');
const router = express.Router();
const { verifyAsgardeoToken } = require('../middleware/asgardeo.middleware');
const {
  addFavorite,
  removeFavorite,
  getFavorites
} = require('../controllers/favoritesController');

router.use(verifyAsgardeoToken);

router.post('/:restaurantId', addFavorite);
router.delete('/:restaurantId', removeFavorite);
router.get('/', getFavorites);

module.exports = router;
