const mongoose = require('mongoose');

exports.address = new mongoose.Schema({
    addressLine: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    postalCode: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
});