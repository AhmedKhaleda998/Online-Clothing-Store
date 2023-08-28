const mongoose = require('mongoose');

const productSchema = require('../schemas/product');

module.exports = mongoose.model('Product', productSchema.product);
