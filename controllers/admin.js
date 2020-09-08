const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
    console.log('First middleware');
    // res.sendFile(path.join(rootDir, 'views/add-product.html'));
    res.render('admin/add-product', {docTitle: 'Add Product', path: '/admin/add-product'})
};

exports.postAddProduct = (req, res) => {
    const product = new Product(req.body.product);
    product.save();
    res.redirect('/products');
};

exports.getAdminProducts = (req, res) => {
    res.render('admin/products', {docTitle: 'Admin Products', path: '/admin/products'})
}
