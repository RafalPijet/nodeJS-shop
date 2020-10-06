const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 1;

exports.getProducts = (req, res) => {
    const page = +req.query.page || 1;
    let totalItems;
    Product.countDocuments()
    .then(numProducts => {
        totalItems = numProducts;
        return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
        res.render('shop/product-list', {
            products,
            docTitle: 'Products',
            path: '/products',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    })
    .catch(err => {
        const error = new Error(err);
        err.httpStatusCode = 500;
        return next(error);
    })  
};

exports.getProductById = (req, res) => {
    const { productId } = req.params;
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
                cartProducts: products
            });
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        })
}

exports.postCart = (req, res) => {
    const { productId } = req.body;
    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product)
        })
        .then(result => {
            res.redirect('/cart');
        })
}

exports.deleteItemCart = (req, res) => {
    const { productId } = req.params;
    req.user.deleteItemCart(productId)
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        });
};


exports.getHomePage = (req, res) => {
    res.render('shop/index', {
        docTitle: 'Home',
        path: '/'
    })
}

exports.getCheckout = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;
            let totalSum = 0;
            products.forEach(item => {
                totalSum += item.productId.price * item.quantity
            })
            res.render('shop/checkout', {
                docTitle: 'Checkout',
                path: '/checkout',
                products,
                totalSum
            });
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        })
}

exports.getOrders = (req, res) => {
    Order.find({ 'user.userId': req.session.user._id })
        .then(orders => {
            res.render('shop/orders', {
                docTitle: 'Orders',
                path: '/orders',
                orders
            });
        })
}

exports.postOrder = (req, res) => {

    req.user.populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(product => {
                return {
                    product: { ...product.productId._doc },
                    quantity: product.quantity
                }
            })
            const order = new Order({ products, user: { email: req.user.email, userId: req.user } })
            return order.save()
        })
        .then(() => {
            req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        });
}

exports.getInvoice = (req, res, next) => {
    const { orderId } = req.params;
    Order.findById(orderId)
        .then(order => {

            if (!order) {
                return next(new Error('No order found!!!'));
            }

            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized!!!'))
            }
            const invoiceName = `invoice-${orderId}.pdf`;
            const invoicePath = path.join('data', 'invoices', invoiceName);
            const pdfDoc = new PDFDocument();
            let totalPrice = 0;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);
            pdfDoc.fontSize(26).font('Helvetica-Bold').text('Invoice', {
                width: 500,
                align: 'center'
            });
            pdfDoc.rect(20, 100, 570, 630).stroke();
            pdfDoc.moveDown();
            order.products.forEach((prod, i) => {
                totalPrice += prod.product.price * prod.quantity;
                pdfDoc.fontSize(14).font('Helvetica').text(`${i + 1}. ${prod.product.title} - ${prod.product.price} x ${prod.quantity} = ${prod.quantity * prod.product.price}$`)
            });
            pdfDoc.fontSize(18).font('Helvetica-Bold').text(`TOTAL: ${totalPrice}$`, {
                width: 500,
                top: 500,
                align: 'right'
            })
            pdfDoc.end();


            // fs.readFile(invoicePath, (err, data) => {

            //     if (err) {
            //         return next(err);
            //     }
            //     res.setHeader('Content-Type', 'application/pdf');
            //     res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            //     res.send(data);
            // })


            // const file = fs.createReadStream(invoicePath);
            // res.setHeader('Content-Type', 'application/pdf');
            // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            // file.pipe(res);

        })
        .catch(err => next(err))
}
