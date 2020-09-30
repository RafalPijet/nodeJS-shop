const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');
const crypto = require('crypto');
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
        errorMessage: message,
        oldInput: { email: '', password: '' },
        validationErrors: []
    })
}

exports.postLogin = (req, res, next) => {
    const { password, email } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            docTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: { email, password },
            validationErrors: errors.array()
        })
    }
    User.findOne({ email })
        .then(user => {
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
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login')
                })
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        });
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
        errorMessage: message,
        oldInput: { email: '', password: '', confirmPassword: '' },
        validationErrors: []
    })
}
exports.postSignup = (req, res, next) => {
    const { email, password, confirmPassword } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            docTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: { email, password, confirmPassword },
            validationErrors: errors.array()
        })
    }
    bcrypt.hash(password, 12)
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
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        });
}

exports.getReset = (req, res, next) => {
    let message = req.flash('error');

    if (message.length) {
        message = message[0]
    } else {
        message = null
    }
    res.render('auth/reset', {
        docTitle: 'Reset password',
        path: '/reset',
        errorMessage: message
    })
}

exports.postReset = (req, res, next) => {
    const { email } = req.body;
    crypto.randomBytes(32, (err, buf) => {

        if (err) {
            req.flash('error', "Something's wrong!!!");
            return res.redirect('/reset')
        }
        const token = buf.toString('hex');
        User.findOne({ email })
            .then(user => {

                if (!user) {
                    req.flash('error', `No account with ${email} email found.`);
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(() => {
                res.redirect('/');
                transporter.sendMail({
                    to: email,
                    from: 'stronglopez@wp.pl',
                    subject: 'Password reset',
                    html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="${process.env.URL}/reset/${token}">link</a> to set new password</p>
                `
                })
            })
            .catch(err => {
                const error = new Error(err);
                err.httpStatusCode = 500;
                return next(error);
            });
    })
}

exports.getNewPassword = (req, res, next) => {
    const { token } = req.params;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            let message = req.flash('error');

            if (message.length) {
                message = message[0]
            } else {
                message = null
            }
            res.render('auth/new-password', {
                docTitle: 'New Password',
                path: '/new-password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            })
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        });

}

exports.postNewPassword = (req, res, next) => {
    const { password, userId, passwordToken } = req.body;
    let resetUser;
    User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
        .then(user => {

            if (!user) {
                req.flash('error', "Something's wrong!!!");
                return res.redirect('/login')
            }
            resetUser = user;
            return bcrypt.hash(password, 12)
        })
        .then(decryptedPassword => {
            resetUser.password = decryptedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(() => {
            res.redirect('/login');
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        })
}
