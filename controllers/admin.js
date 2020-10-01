const { validationResult } = require('express-validator/check');
const Product = require('../models/product');
const fileHandling = require('../util/file');

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
    const { title, price, description } = req.body;
    const image = req.file;
    
    if (!image) {
        return res.status(422).render('admin/edit-product', {
            docTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            errorMessage: 'Attached file is not an image',
            validationErrors: [],
            product: {title, price, description},
            hasError: true
        })
    }
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            docTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            product: {title, price, description},
            hasError: true
        })
    }

    const imageUrl = image.path;

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
    const { title, price, description } = req.body;
    const image = req.file;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            docTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            product: {title, price, description, _id: productId},
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

            if (image) {
                fileHandling.deleteFile(product.imageUrl)
                product.imageUrl = image.path;
            }
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
    const { imageUrl } = req.body;

    Product.deleteOne({_id: productId, userId: req.user._id})
        .then(() => {
            fileHandling.deleteFile(imageUrl);
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        })
}
