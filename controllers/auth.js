const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    // const cookies = req.get('Cookie').split(';');
    // const isLoggedIn = cookies[cookies.length - 1].trim().split('=')[1] === 'true';
    // console.log(req.session);
    res.render('auth/login', {
        docTitle: 'Login',
        path: '/login',
        isAuthenticated: req.session.isLoggedIn
    })
}

exports.postLogin = (req, res, next) => {
    const {password, email} = req.body;
    User.findById('5f685d895fecbf0a67830f34')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(err => {

                if (err) console.log(err);
                res.redirect('/')
            })
        })
        .catch(err => console.log(err));
    // res.setHeader('Set-Cookie', 'loggedIn=true')
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) console.log(err);
        res.redirect('/');
    });
}
