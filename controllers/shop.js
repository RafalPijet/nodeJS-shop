const Product = require('../models/product');

exports.getProducts = (req, res) => {
    Product.fetchData(products => {
        console.log(products)
        res.render('shop/product-list', {products, docTitle: 'Products', path: '/products'});
    });

};

exports.getCart = (req, res) => {
    res.render('shop/cart', {docTitle: 'Cart', path: '/cart'})
}


exports.getHomePage = (req, res) => {
    res.render('shop/index', {docTitle: 'Home', path: '/'})
}

exports.getCheckout = (req, res) => {
    res.render('shop/checkout', {docTitle: 'Checkout', path: '/checkout'})
}
