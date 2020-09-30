const { validationResult } = require('express-validator/check');
const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
    res.render('admin/edit-product', {
        docTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        errorMessage: null,
        validationErrors: [],
        hasError: false
    })
};

exports.postAddProduct = (req, res, next) => {
    const { title, imageUrl, price, description } = req.body;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            docTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            product: {title, imageUrl, price, description},
            hasError: true
        })
    }

    const product = new Product({ title, price, description, imageUrl, userId: req.session.user });
    product.save()
        .then(() => {
            console.log('Product has added :)')
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        });
};

exports.getEditProduct = (req, res) => {
    const { productId } = req.params;
    const isEdit = req.query.edit;

    if (!isEdit) {
        return res.redirect('/products')
    }
    Product.findById(productId)
        .then(product => {

            if (!product) {
                return res.redirect('/products');
            }
            res.render('admin/edit-product', {
                docTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: isEdit,
                errorMessage: null,
                validationErrors: [],
                product,
                hasError: false
            })
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        })
};

exports.postEditProduct = (req, res) => {
    const { productId } = req.body;
    const { title, imageUrl, price, description } = req.body;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            docTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            product: {title, imageUrl, price, description, _id: productId},
            hasError: true
        })
    }

    Product.findById(productId)
        .then(product => {

            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.title = title;
            product.price = price;
            product.description = description;
            product.imageUrl = imageUrl;
            return product.save()
            .then(() => {
                console.log('Product has UPDATED!!!')
                res.redirect('/admin/products');
            })
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        });
};

exports.getAdminProducts = (req, res) => {
    Product.find({userId: req.user._id})
        .then(products => {
            res.render('admin/products', {
                products,
                docTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        });
}

exports.deleteProduct = (req, res) => {
    const { productId } = req.params;
    Product.deleteOne({_id: productId, userId: req.user._id})
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        })
}
