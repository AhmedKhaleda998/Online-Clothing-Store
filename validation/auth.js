const { body } = require('express-validator');

const User = require('../models/user');

exports.isUser = () => {
    return [
        body('name')
            .notEmpty().withMessage('Name is required')
            .isAlpha().withMessage('Name must be alphabetic')
            .isLength({ min: 3, max: 256 }).withMessage('Name must be at least 3 characters long')
            .trim(),
        body('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email address')
            .normalizeEmail()
            .trim()
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email address already exists');
                    }
                });
            }),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 8, max: 256 }).withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
            .withMessage('Password must be alphanumeric (contain at least one uppercase letter, one lowercase letter, and one number)')
            .trim(),
        body('role')
            .optional()
            .isIn(['customer', 'admin']).withMessage('Role must be customer | admin'),
    ];
};

exports.login = () => {
    return [
        body('email')
            .isEmail().withMessage('Invalid email address'),
        body('password')
            .notEmpty().withMessage('Password must not be empty'),
    ];
};

