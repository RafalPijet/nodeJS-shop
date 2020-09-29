const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');
const isAuth = require('../middleware/is-auth');

const adminController = require('../controllers/admin');


router.get('/add-product', isAuth, adminController.getAddProduct);
router.get('/products', isAuth, adminController.getAdminProducts);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post('/add-product', [
    body('title', 'Wrong title')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('imageUrl', 'Wrong imageUrl')
        .isURL(),
    body('price', 'Wrong price')
        .isFloat({min: 0.01, max: 100000}),
    body('description', 'Wrong description')
        .isLength({min: 5, max: 400})
        .trim()
], isAuth, adminController.postAddProduct);
router.post('/edit-product', [
    body('title', 'Wrong title')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('imageUrl', 'Wrong imageUrl')
        .isURL(),
    body('price', 'Wrong price')
        .isFloat({min: 0.01, max: 100000}),
    body('description', 'Wrong description')
        .isLength({min: 5, max: 400})
        .trim()
], isAuth, adminController.postEditProduct);
router.post('/delete-product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
