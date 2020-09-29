const express = require('express');
const { check, body } = require('express-validator/check');
const router = express.Router();
const authController = require('../controllers/auth');
const User = require('../models/user');

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.get('/reset', authController.getReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/login',
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .normalizeEmail()
            .custom((value, { req }) => {

                return User.findOne({ email: value })
                    .then(user => {

                        if (!user) {
                            return Promise.reject(`User for login ${value} doesn't exist`)
                        }
                    })
            }),
        body(
            'password',
            'Please enter a password with only numbers and text and at least 5 characters.'
        )
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim()
    ], authController.postLogin);
router.post('/logout', authController.postLogout);
router.post('/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                    .then(user => {

                        if (user) {
                            return Promise.reject('E-Mail exists already, please pick a different one.')
                        }
                    });
            })
            .normalizeEmail(),
        body(
            'password',
            'Please enter a password with only numbers and text and at least 5 characters.'
        )
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {

                if (value.toString() !== req.body.password.toString()) {
                    throw new Error('Passwords have to match!!!')
                }
                return true;
            })
    ],
    authController.postSignup);
router.post('/reset', authController.postReset);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
