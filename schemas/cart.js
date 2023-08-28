const mongoose = require('mongoose');

exports.cartItem = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    quantity: {
        type: Number,
        default: 1,
    },
    size: {
        type: String,
        required: true,
    },
});