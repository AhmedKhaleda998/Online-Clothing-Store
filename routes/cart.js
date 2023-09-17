const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cart');
const isAuth = require('../middleware/isAuth');
const checkUser = require('../middleware/checkUser');

router.get('/', isAuth, checkUser.isCustomer, cartController.view);

router.post('/:productId', isAuth, checkUser.isCustomer, cartController.addItem);

router.put('/:productId', isAuth, checkUser.isCustomer, cartController.updateItem);

router.delete('/:productId', isAuth, checkUser.isCustomer, cartController.removeItem);

module.exports = router;
