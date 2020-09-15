const Product = require('../models/product');

exports.getProducts = (req, res) => {
    Product.findAll()
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
    Product.findByPk(productId)
        .then(product => {
            res.render('shop/product-detail', {docTitle: 'Product Detail', product: product, path: '/products'})
        })
}

exports.getCart = (req, res) => {
    req.user.getCart()
        .then(cart => {
            return cart.getProducts();
        })
        .then(products => {
            res.render('shop/cart', {docTitle: 'Cart', path: '/cart', cartProducts: products});
        })
        .catch(err => console.log(err));
}

exports.postCart = (req, res) => {
    const {productId} = req.body;
    let fetchedCart;
    let newQuantity = 1;
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: productId } });
        })
        .then(products => {
            let product;

            if (products.length > 0) {
                product = products[0];
            }

            if (product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return product;
            }
            return Product.findByPk(productId);
        })
        .then(product => {
            return fetchedCart.addProduct(product, {
                through: { quantity: newQuantity }
            });
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));

}

exports.deleteItemCart = (req, res) => {
    const {productId} = req.params;
    req.user.getCart()
        .then(cart => {
            return cart.getProducts({where: {id: productId}});
        })
        .then(products => {
            const product = products[0];
            return product.cartItem.destroy();
        })
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
    req.user.getOrders({include: ['products']})
        .then(orders => {
            res.render('shop/orders', {docTitle: 'Orders', path: '/orders', orders})
        })
        .catch(err => console.log(err));
}

exports.postOrder = (req, res) => {
    let fetchedCart;
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts()
        })
        .then(products => {
            return req.user.createOrder()
                .then(order => {
                    return order.addProducts(
                        products.map(product => {
                            product.orderItem = {quantity: product.cartItem.quantity}
                            return product;
                        })
                    );
                })
                .catch(err => console.log(err));
        })
        .then(() => {
            return fetchedCart.setProducts(null)
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
}
