const { body } = require('express-validator');

exports.isProduct = () => {
    return [
        body('name')
            .isLength({ min: 3, max: 512 }).withMessage('Name must be at least 3 characters long')
            .trim(),
        body('price')
            .isNumeric().withMessage('Price must be numeric'),
        body('size')
            .isLength({ min: 1, max: 256 }).withMessage('Size must be at least 1 value')
            .trim(),
        body('description')
            .isLength({ min: 3, max: 1024 }).withMessage('Description must be at least 3 characters long')
            .trim(),
        body('gender')
            .isIn(['masculine', 'feminine', 'neutral']).withMessage('gender must be masculine | feminine | neutral'),
        body('collectionSeason')
            .isAlpha().withMessage('Collection must be alphabetic')
            .trim(),
    ];
};

exports.requires = () => {
    return [
        body('name')
            .notEmpty().withMessage('Name is required'),
        body('price')
            .notEmpty().withMessage('Price is required'),
        body('size')
            .notEmpty().withMessage('Size is required'),
        body('description')
            .notEmpty().withMessage('Description is required'),
        body('gender')
            .notEmpty().withMessage('Gender is required'),
        body('collectionSeason')
            .notEmpty().withMessage('Collection is required'),
    ];
};