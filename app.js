const express = require('express');
const path = require('path');
require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const rootDir = require('./util/path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(rootDir, 'public')));
// app.use(express.urlencoded({extended: false}));

app.use((req, res, next) => {
    User.findById('5f685d895fecbf0a67830f34')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
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
        app.listen(3003);
        console.log('Database is connected')
    })
    .catch(err => console.log(err));
