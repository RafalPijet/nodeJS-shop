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
    const product = new Product(null, title, imageUrl, description, price);
    product.save();
    res.redirect('/products');
};

exports.getEditProduct = (req, res) => {
    const {productId} = req.params;
    const isEdit = req.query.edit;

    if (!isEdit) {
        return res.redirect('/products')
    }
    Product.findProductById(productId, product => {

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
};

exports.postEditProduct = (req, res) => {
    const {productId} = req.body;
    const {title, imageUrl, price, description} = req.body;
    const updatedProduct = new Product(productId, title, imageUrl, description, price);
    updatedProduct.save();
    res.redirect('/admin/products');
};

exports.getAdminProducts = (req, res) => {
    Product.fetchData(products => {
        res.render('admin/products', {products, docTitle: 'Admin Products', path: '/admin/products'})
    })
}

exports.deleteProduct = (req, res) => {
    const {productId} = req.params;
    Product.deleteProductById(productId);
    res.redirect('/admin/products');
}
