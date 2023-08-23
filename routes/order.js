const express = require('express');
const router = express.Router();

const orderController = require('../controllers/order');
const isAuth = require('../middleware/isAuth');
const checkUser = require('../middleware/checkUser');

router.get('/', isAuth, checkUser.isCustomer, orderController.view);

router.post('/', isAuth, checkUser.isCustomer, orderController.create);

module.exports = router;
