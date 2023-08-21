const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const isAuth = require('../middleware/isAuth');

router.get('/', productController.getAllProducts);

router.post('/', isAuth, productController.createProduct);

router.get('/:productId', productController.getProduct);

router.put('/:productId', isAuth, productController.updateProduct);

router.delete('/:productId', isAuth, productController.deleteProduct);

module.exports = router;
