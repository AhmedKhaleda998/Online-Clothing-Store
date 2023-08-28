const express = require('express');
const router = express.Router();

const addressController = require('../controllers/address');
const isAuth = require('../middleware/isAuth');
const checkUser = require('../middleware/checkUser');
const addressValidation = require('../validation/address');

router.get('/', isAuth, checkUser.isCustomer, addressController.viewAll);

router.post('/', isAuth, checkUser.isCustomer, addressValidation.isAddress(), addressValidation.requires(), addressController.add);

router.get('/:addressId', isAuth, checkUser.isCustomer, addressController.view);

router.put('/:addressId', isAuth, checkUser.isCustomer, addressValidation.isAddress(), addressController.update);

router.delete('/:addressId', isAuth, checkUser.isCustomer, addressController.remove);

module.exports = router;
