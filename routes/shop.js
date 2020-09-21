const express = require('express');
const router = express.Router();

const shopController = require('../controllers/shop');

router.get('/cart', shopController.getCart);
router.post('/cart', shopController.postCart);
router.post('/cart-delete-item/:productId', shopController.deleteItemCart);
router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProductById);
router.get('/', shopController.getHomePage);
// router.get('/checkout', shopController.getCheckout);
router.get('/orders', shopController.getOrders);
router.post('/create-order', shopController.postOrder);

module.exports = router;
