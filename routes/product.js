const express = require('express');
const router = express.Router();

const productController = require('../controllers/product');
const isAuth = require('../middleware/isAuth');
const checkUser = require('../middleware/checkUser');
const productValidation = require('../validation/product');

router.get('/', productController.viewAll);

router.get('/search', productController.search);

router.get('/collections', productController.viewAll);

router.get('/collections/:keyword', productController.filter);

router.post('/', isAuth, checkUser.isAdmin, productValidation.requires(), productValidation.isProduct(), productController.create);

router.get('/:productId', productController.view);

router.put('/:productId', isAuth, checkUser.isAdmin, productValidation.requires(), productController.update);

router.delete('/:productId', isAuth, checkUser.isAdmin, productController.delete);

module.exports = router;
