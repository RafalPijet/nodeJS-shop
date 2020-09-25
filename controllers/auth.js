const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
require('dotenv').config();

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.SENDGRID_KEY
    }
}))

exports.getLogin = (req, res, next) => {
    // const cookies = req.get('Cookie').split(';');
    // const isLoggedIn = cookies[cookies.length - 1].trim().split('=')[1] === 'true';
    // console.log(req.session);
    let message = req.flash('error');
    
    if (message.length) {
        message = message[0]
    } else {
        message = null
    }
    
    res.render('auth/login', {
        docTitle: 'Login',
        path: '/login',
        errorMessage: message
    })
}

exports.postLogin = (req, res, next) => {
    const { password, email } = req.body;
    User.findOne({ email })
        .then(user => {

            if (!user) {
                req.flash('error', 'Invalid email');
                return res.redirect('/login')
            }
            bcrypt.compare(password, user.password)
                .then(isMatch => {

                    if (isMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {

                            if (err) console.log(err);
                            res.redirect('/')
                        })
                    }
                    req.flash('error', 'Invalid password');
                    res.redirect('/login');
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login')
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

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    
    if (message.length) {
        message = message[0]
    } else {
        message = null
    }
    res.render('auth/signup', {
        path: '/signup',
        docTitle: 'Signup',
        errorMessage: message
    })
}
exports.postSignup = (req, res, next) => {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        req.flash('error', 'Passowrd and Confirm Password field are different!!!');
        return res.redirect('/signup');
    }
    User.findOne({ email })
        .then(foundUser => {

            if (foundUser) {
                req.flash('error', 'User already exists')
                return res.redirect('/signup')
            }
            return bcrypt.hash(password, 12)
                .then(decryptedPassword => {
                    const user = new User({ email, password: decryptedPassword, cart: { items: [] } });
                    return user.save();
                })
                .then(() => {
                    res.redirect('/login');
                    return transporter.sendMail({
                        to: email,
                        from: 'stronglopez@wp.pl',
                        subject: 'Signup succeeded!',
                        html: '<h1>You successfuly signed up!</h1>'
                    })
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
}
