const express = require('express');
const path = require('path');
require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

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

const csrfProtection = csrf();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {

    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage, fileFilter }).single('image'));
app.use(express.static(path.join(rootDir, 'public')));
app.use('/images', express.static(path.join(rootDir, 'images')));
// app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: store
}))

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use((req, res, next) => {

    if (req.session.isLoggedIn) {
        User.findById(req.session.user._id)
            .then(user => {

                if (!user) {
                    return next();
                }
                req.user = user;
                next();
            })
            .catch(err => {
                next(new Error(err))
            })
    } else {
        next();
    }

})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500', errorController.get500Page);
app.use(errorController.get404Page);

app.use((error, req, res, next) => {
    res.status(500).render('500',
        {
            docTitle: 'Error!',
            path: '/500',
            isAuthenticated: req.session.isLoggedIn
        }
    )
})

mongoose.connect(process.env.MONGO_DB_ACCESS)
    .then(() => {
        app.listen(process.env.PORT);
        console.log('Database is connected')
    })
    .catch(err => console.log(err));
