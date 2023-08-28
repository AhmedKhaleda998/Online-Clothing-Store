const { body } = require('express-validator');

exports.info = () => {
    return [
        body('name')
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 3, max: 512 }).withMessage('Name must be at least 3 characters long')
            .trim(),
        body('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Please enter a valid email address')
            .normalizeEmail(),
        body('phone')
            .notEmpty().withMessage('Phone number is required')
            .isLength({ min: 11, max: 11 }).withMessage('Phone must be 11 digits long')
            .isNumeric().withMessage('Phone must be numeric')
            .trim(),
        body('message')
            .notEmpty().withMessage('Message is required')
            .isLength({ min: 3, max: 1024 }).withMessage('Message must be at least 3 characters long')
            .trim(),
    ];
};
