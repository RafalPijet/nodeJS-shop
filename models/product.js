const fs = require('fs');
const path = require('path');

const Cart = require('../models/cart');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'products.json'
);

const getProductsFromFile = cb => {
    fs.readFile(p, (err, data) => {
        !err ? cb(JSON.parse(data)) : cb([]);
    })
}

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile(products => {

            if (this.id) {
                const existingProductIndex = products.findIndex(prod => prod.id === this.id);
                const updatedProducts = [...products];
                updatedProducts[existingProductIndex] = this;
                fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                    console.log(err);
                })
            } else {
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), err => {
                    console.log(err);
                })
            }
        })
    }

    static fetchData(cb) {
        getProductsFromFile(cb)
    }

    static findProductById(id, cb) {
        getProductsFromFile(products => {
            const product = products.find(item => item.id === id);
            cb(product);
        })
    }

    static deleteProductById(productId) {
        getProductsFromFile(products => {
            const product = products.find(prod => prod.id === productId);
            const productsAfterDelete = products.filter(prod => prod.id !== productId);
            fs.writeFile(p, JSON.stringify(productsAfterDelete), err => {
                Cart.deleteProduct(productId, product.price);
            })
        })
}
}
