const express = require('express');
const router = express.Router();

const orderController = require('../controllers/order');
const isAuth = require('../middleware/isAuth');
const checkUser = require('../middleware/checkUser');

router.get('/all', isAuth, checkUser.isAdmin, orderController.viewAll);

router.get('/', isAuth, checkUser.isCustomer, orderController.view);

router.get('/checkout', isAuth, checkUser.isCustomer, orderController.checkout);

router.get('/success', orderController.success);

router.get('/cancel', orderController.cancel);

module.exports = router;
