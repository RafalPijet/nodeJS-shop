const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res) => {
    Product.find()
        .then(products => {
            res.render('shop/product-list', {
                products,
                docTitle: 'Products',
                path: '/products',
                isAuthenticated: req.session.isLoggedIn
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
                path: '/products',
                isAuthenticated: req.session.isLoggedIn
            })
        })
}

exports.getCart = (req, res) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(item => {
                return {
                    quantity: item.quantity,
                    title: item.productId.title,
                    price: item.price,
                    description: item.description,
                    _id: item.productId._id
                }
            })
            res.render('shop/cart', {
                docTitle: 'Cart',
                path: '/cart',
                cartProducts: products,
                isAuthenticated: req.session.isLoggedIn
            });
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
    res.render('shop/index', {docTitle: 'Home', path: '/', isAuthenticated: req.session.isLoggedIn})
}

exports.getCheckout = (req, res) => {
    res.render('shop/checkout', {docTitle: 'Checkout', path: '/checkout', isAuthenticated: req.session.isLoggedIn})
}

exports.getOrders = (req, res) => {
    Order.find({'user.userId': req.session.user._id})
        .then(orders => {
            res.render('shop/orders', {
                docTitle: 'Orders',
                path: '/orders',
                orders,
                isAuthenticated: req.session.isLoggedIn
            });
        })
}

exports.postOrder = (req, res) => {

    req.session.user.populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(product => {
                return {
                    product: {...product.productId._doc},
                    quantity: product.quantity
                }
            })
            const order = new Order({products, user: {name: user.name, userId: user._id}})
            return order.save()
        })
        .then(() => {
            req.session.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
}
