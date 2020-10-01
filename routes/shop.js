const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

const shopController = require('../controllers/shop');

router.get('/cart', isAuth, shopController.getCart);
router.post('/cart', isAuth, shopController.postCart);
router.post('/cart-delete-item/:productId', isAuth, shopController.deleteItemCart);
router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProductById);
router.get('/', shopController.getHomePage);
// router.get('/checkout', shopController.getCheckout);
router.get('/orders', isAuth, shopController.getOrders);
router.get('/orders/:orderId', isAuth, shopController.getInvoice);
router.post('/create-order', isAuth, shopController.postOrder);

module.exports = router;
