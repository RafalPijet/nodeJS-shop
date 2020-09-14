const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
    res.render('admin/edit-product', {
        docTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    })
};

exports.postAddProduct = (req, res) => {
    const {title, imageUrl, price, description} = req.body;
    Product.create({title, price, imageUrl, description})
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};

exports.getEditProduct = (req, res) => {
    const {productId} = req.params;
    const isEdit = req.query.edit;

    if (!isEdit) {
        return res.redirect('/products')
    }
    Product.findByPk(productId)
        .then(product => {

            if (!product) {
                return res.redirect('/products');
            }
            res.render('admin/edit-product', {
                docTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: isEdit,
                product
            })
        })
        .catch(err => console.log(err))
};

exports.postEditProduct = (req, res) => {
    const {productId} = req.body;
    const {title, imageUrl, price, description} = req.body;
    Product.findByPk(productId)
        .then(product => {
            product.title = title;
            product.imageUrl = imageUrl;
            product.price = price;
            product.decriprion = description;
            return product.save();
        })
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};

exports.getAdminProducts = (req, res) => {
    Product.findAll()
        .then(products => {
            res.render('admin/products', {
                products,
                docTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => console.log(err))

}

exports.deleteProduct = (req, res) => {
    const {productId} = req.params;
    Product.findByPk(productId)
        .then(product => {
            return product.destroy();
        })
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
}
