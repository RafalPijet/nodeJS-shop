const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const rootDir = require('./util/path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const sequelize = require('./util/database');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(rootDir, 'public')));
// app.use(express.urlencoded({extended: false}));

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404Page);

sequelize.sync()
    .then(result => {
        app.listen(3003);
    })
    .catch(err => console.log(err));

