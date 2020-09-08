const express = require('express');
const router = express.Router();

const shopController = require('../controllers/shop');

router.get('/cart', shopController.getCart);
router.get('/products', shopController.getProducts);
router.get('/', shopController.getHomePage);
router.get('/checkout', shopController.getCheckout);

module.exports = router;
