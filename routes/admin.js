const express = require('express');
const path = require('path');
const router = express.Router();

const rootDir = require('../util/path');
const products = [];

router.get('/add-product',(req, res) => {
    console.log('First middleware');
    // res.sendFile(path.join(rootDir, 'views/add-product.html'));
    res.render('add-product', {docTitle: 'Add Product', path: '/admin/add-product'})
});

router.post('/product', (req, res) => {
    console.log(products);
    products.push({title: req.body.product});
    res.redirect('/');
});

exports.routes = router;
exports.products = products;
