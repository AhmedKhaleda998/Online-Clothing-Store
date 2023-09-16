const { body } = require('express-validator');

exports.isAddress = () => {
    return [
        body('addressLine')
            .isLength({ min: 3, max: 256 }).withMessage('Address line must be at least 3 characters long')
            .trim(),
        body('country')
            .isAlpha().withMessage('Country must be alphabetic')
            .isLength({ min: 3, max: 256 }).withMessage('Country must be at least 3 characters long')
            .trim(),
        body('city')
            .isLength({ min: 3, max: 256 }).withMessage('City must be at least 3 characters long')
            .trim(),
        body('state')
            .isLength({ min: 3, max: 256 }).withMessage('Zip must be at least 3 characters long')
            .trim(),
        body('postalCode')
            .isLength({ min: 3, max: 256 }).withMessage('Street must be at least 3 characters long')
            .trim(),
        body('phone')
            .isNumeric().withMessage('Phone must be numeric')
            .isLength({ min: 7, max: 15 }).withMessage('Phone must be at least 7 digits long')
            .trim(),
    ];
};

exports.requires = () => {
    return [
        body('addressLine')
            .notEmpty().withMessage('Address line is required'),
        body('country')
            .notEmpty().withMessage('Country is required'),
        body('city')
            .notEmpty().withMessage('City is required'),
        body('state')
            .notEmpty().withMessage('Zip is required'),
        body('postalCode')
            .notEmpty().withMessage('Street is required'),
        body('phone')
            .notEmpty().withMessage('Number is required'),
    ];
}