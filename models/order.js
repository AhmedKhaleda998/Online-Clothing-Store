const mongoose = require('mongoose');

const orderSchema = require('../schemas/order');

module.exports = mongoose.model('Order', orderSchema.order);
