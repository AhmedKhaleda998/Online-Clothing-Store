const express = require('express');
const router = express.Router();

const productController = require('../controllers/product');
const isAuth = require('../middleware/isAuth');
const checkUser = require('../middleware/checkUser');
const productValidation = require('../validation/product');

router.get('/', productController.viewAll);

router.post('/', isAuth, checkUser.isAdmin, productValidation.requires(), productValidation.isProduct(), productController.create);

router.get('/:productId', productController.view);

router.put('/:productId', isAuth, checkUser.isAdmin,productValidation.requires(), productController.update);

router.delete('/:productId', isAuth, checkUser.isAdmin, productController.delete);

module.exports = router;
