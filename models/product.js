const getDb = require('../util/database').getDb;
const ObjectId = require('mongodb').ObjectID;

class Product {
    constructor(title, price, description, imageUrl, id, userId) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id ? ObjectId(id) : null;
        this.userId = ObjectId(userId)
    }

    save() {
        const db = getDb();
        let dbOperation;

        if (this._id) {
            dbOperation = db.collection('products').updateOne({_id: this._id}, {$set: this});
        } else {
            dbOperation = db.collection('products').insertOne(this);
        }
        return dbOperation
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('products').find().toArray()
            .then(products => {
                return products
            })
            .catch(err => console.log(err));
    }

    static findById(productId) {
        const db = getDb();
        return db.collection('products').findOne({_id: ObjectId(productId)})
            .then(product => {
                return product
            })
            .catch(err => console.log(err))
    }

    static deleteById(productId) {
        const db = getDb();
        return db.collection('products').deleteOne({_id: ObjectId(productId)})
            .then(() => console.log('Product has deleted'))
            .catch(err => console.log(err))
    }
}

module.exports = Product;
