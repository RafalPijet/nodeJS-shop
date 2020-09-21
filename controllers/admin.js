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
    const product = new Product({title, price, description, imageUrl, userId: req.user});
    product.save()
        .then(() => {
            console.log('Product has added :)')
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
    Product.findById(productId)
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
    Product.findById(productId)
        .then(product => {
            product.title = title;
            product.price = price;
            product.description = description;
            product.imageUrl = imageUrl;
            return product.save()
        })
        .then(() => {
            console.log('Product has UPDATED!!!')
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};

exports.getAdminProducts = (req, res) => {
    Product.find()
        // .populate('userId', 'name cart -_id')
        .then(products => {
            console.log(products);
            res.render('admin/products', {
                products,
                docTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => console.log(err));
}

exports.deleteProduct = (req, res) => {
    const {productId} = req.params;
    Product.findByIdAndRemove(productId)
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err))
}
