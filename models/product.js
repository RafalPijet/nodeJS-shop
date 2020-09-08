const fs = require('fs');
const path = require('path');

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
    constructor(title) {
        this.title = title
    }

    save() {
        getProductsFromFile(products => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), err => {
                console.log(err);
            })
        })
    }

    static fetchData(cb) {
        getProductsFromFile(cb)
    }
}
