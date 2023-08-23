const express = require('express');
const router = express.Router();

const productController = require('../controllers/product');
const isAuth = require('../middleware/isAuth');
const checkUser = require('../middleware/checkUser');

router.get('/', productController.viewAll);

router.post('/', isAuth, checkUser.isAdmin, productController.create);

router.get('/:productId', productController.view);

router.put('/:productId', isAuth, checkUser.isAdmin, productController.update);

router.delete('/:productId', isAuth, checkUser.isAdmin, productController.delete);

module.exports = router;
