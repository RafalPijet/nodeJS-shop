const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

const adminController = require('../controllers/admin');


router.get('/add-product', isAuth, adminController.getAddProduct);
router.get('/products', isAuth, adminController.getAdminProducts);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post('/add-product', isAuth, adminController.postAddProduct);
router.post('/edit-product', isAuth, adminController.postEditProduct);
router.post('/delete-product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
