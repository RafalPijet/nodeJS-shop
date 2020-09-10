const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res) => {
    Product.fetchData(products => {
        res.render('shop/product-list', {products, docTitle: 'Products', path: '/products'});
    });

};

exports.getProductById = (req, res) => {
    const {productId} = req.params;
    Product.findProductById(productId, product => {
        res.render('shop/product-detail', {docTitle: 'Product Detail', product, path: '/products'})
    })
}

exports.getCart = (req, res) => {
    Cart.getCart(cart => {
        Product.fetchData(products => {
            const cartProducts = [];
            for (product of products) {
                const cartProductData = cart.products.find(prod => prod.id === product.id);

                if (cartProductData) {
                    cartProducts.push({productData: product, qty: cartProductData.qty})
                }
            }
            res.render('shop/cart', {docTitle: 'Cart', path: '/cart', cartProducts});
        })
    })
}

exports.postCart = (req, res) => {
    const {productId} = req.body;
    Product.findProductById(productId, product => {
        Cart.addProduct(productId, product.price)
    })
    res.redirect('/products')
}

exports.deleteItemCart = (req, res) => {
    const {productId} = req.params;
    Product.findProductById(productId, product => {
        Cart.deleteProduct(productId, product.price);
    })
    res.redirect('/cart');
};


exports.getHomePage = (req, res) => {
    res.render('shop/index', {docTitle: 'Home', path: '/'})
}

exports.getCheckout = (req, res) => {
    res.render('shop/checkout', {docTitle: 'Checkout', path: '/checkout'})
}

exports.getOrders = (req, res) => {
    res.render('shop/orders', {docTitle: 'Orders', path: '/orders'})
}
