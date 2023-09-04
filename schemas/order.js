const mongoose = require('mongoose');

const addressSchema = require('../schemas/address');

const orderItem = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    size: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
});

exports.order = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [orderItem],
    totalAmount: {
        type: Number,
        required: true,
    },
    shippingAddress: addressSchema.address,
},
    {
        timestamps: true,
    }
);