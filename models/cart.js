const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
);

module.exports = class Cart {
    static addProduct(id, productPrice) {
        fs.readFile(p, (err, data) => {
            let cart = {products: [], totalPrice: 0};

            if (!err) {
                cart = JSON.parse(data);
            }
            const existingProductIndex = cart.products.findIndex(item => item.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatingProduct;

            if (existingProduct) {
                updatingProduct = {...existingProduct};
                updatingProduct.qty = updatingProduct.qty + 1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatingProduct;
            } else {
                updatingProduct = {id, qty: 1};
                cart.products = [...cart.products, updatingProduct];
            }
            cart.totalPrice = cart.totalPrice + +productPrice;
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            })
        })
    }

    static deleteProduct(id, productPrice) {
        fs.readFile(p, (err, data) => {

            if (err) {
                return;
            }
            const updatedCart = { ...JSON.parse(fileContent) };
            const product = updatedCart.products.find(prod => prod.id === id);
            if (!product) {
                return;
            }
            const productQty = product.qty;
            updatedCart.products = updatedCart.products.filter(
                prod => prod.id !== id
            );
            updatedCart.totalPrice =
                updatedCart.totalPrice - productPrice * productQty;
            fs.writeFile(p, JSON.stringify(updatedCart), err => {
                console.log(err)
            })
        })
    }

    static getCart(cb) {
        fs.readFile(p, (err, data) => {
            const cart = JSON.parse(data);
            err ? cb(null) : cb(cart)
        })
    }
}
