const getDb = require('../util/database').getDb;
const ObjectId = require('mongodb').ObjectID;

class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save() {
        const db = getDb();
        return db.collection('users').insertOne(this)
    }

    addToCart(product) {
        const db = getDb();
        const cartProductIndex = this.cart.items.findIndex(item => {
            return item.productId.toString() === product._id.toString()
        })
        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];

        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({
                productId: ObjectId(product._id),
                quantity: newQuantity
            })
        }
        const updatedCart = {items: updatedCartItems};
        return db.collection('users').updateOne(
            {_id: ObjectId(this._id)},
            {$set: {cart: updatedCart}}
        );
    }

    getCart() {
        const db = getDb();
        const productsId = this.cart.items.map(item => item.productId);
        return db.collection('products').find({_id: { $in: productsId }}).toArray()
            .then(products => {
                return products.map(product => {
                    return {
                        ...product,
                        quantity: this.cart.items.find(item => item.productId.toString() === product._id.toString()).quantity
                    }
                })
            })

    }

    deleteItemCart(productId) {
        const db = getDb();
        const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
        return db.collection('users').updateOne({_id: this._id}, {$set: {cart: {items: updatedCartItems}}});
    }

    static findUserById(id) {
        const db = getDb();
        return db.collection('users').findOne({_id: ObjectId(id)})
    }
}

module.exports = User;
