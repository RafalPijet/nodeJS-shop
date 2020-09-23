const express = require('express');
const path = require('path');
require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const rootDir = require('./util/path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();
const store = new MongoDBStore({
    uri: process.env.MONGO_DB_ACCESS,
    collection: 'sessions'
})

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(rootDir, 'public')));
// app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: store
}))

app.use((req, res, next) => {

    if (req.session.isLoggedIn) {
        User.findById(req.session.user._id)
            .then(user => {
                req.user = user;
                next();
            })
            .catch(err => console.log(err))
    }

})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404Page);

mongoose.connect(process.env.MONGO_DB_ACCESS)
    .then(() => {
        User.findOne()
            .then(user => {

                if (!user) {
                    const user = new User({
                        name: 'David',
                        email: 'david@gmail.com',
                        cart: {
                            items: []
                        }
                    })
                    user.save();
                }
            })
            .catch(err => console.log(err));
        app.listen(3005);
        console.log('Database is connected')
    })
    .catch(err => console.log(err));
