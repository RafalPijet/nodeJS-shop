const Product = require('../models/product');

exports.getProducts = (req, res) => {
    Product.fetchAll()
        .then(products => {
            res.render('shop/product-list', {
                products,
                docTitle: 'Products',
                path: '/products'
            });
        })
        .catch(err => console.log(err))
};

exports.getProductById = (req, res) => {
    const {productId} = req.params;
    Product.findById(productId)
        .then(product => {
            res.render('shop/product-detail', {
                docTitle: 'Product Detail',
                product: product,
                path: '/products'
            })
        })
}

exports.getCart = (req, res) => {
    req.user.getCart()
        .then(products => {
            res.render('shop/cart', {docTitle: 'Cart', path: '/cart', cartProducts: products});
        })
        .catch(err => console.log(err))
}

exports.postCart = (req, res) => {
    const {productId} = req.body;
    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product)
        })
        .then(result => {
            res.redirect('/cart');
        })
}

exports.deleteItemCart = (req, res) => {
    const {productId} = req.params;
    req.user.deleteItemCart(productId)
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
};


exports.getHomePage = (req, res) => {
    res.render('shop/index', {docTitle: 'Home', path: '/'})
}

exports.getCheckout = (req, res) => {
    res.render('shop/checkout', {docTitle: 'Checkout', path: '/checkout'})
}

exports.getOrders = (req, res) => {
    req.user.getOrders()
        .then(orders => {
            res.render('shop/orders', {docTitle: 'Orders', path: '/orders', orders})
        })
}

exports.postOrder = (req, res) => {
    req.user.addOrder()
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
}
