const mongoose = require('mongoose');

const addressSchema = require('../schemas/address');
const cartSchema = require('../schemas/cart');

exports.user = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'customer'],
        default: 'customer',
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        }
    ],
    cart: [cartSchema.cartItem],
    addresses: [addressSchema.address],
},
    {
        timestamps: true,
    }
);