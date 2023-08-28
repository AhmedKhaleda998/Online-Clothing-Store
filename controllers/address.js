const { validationResult } = require('express-validator');

const User = require('../models/user');

exports.viewAll = async (req, res, next) => {
    if (req.userRole !== 'customer') {
        return res.status(403).json({ error: 'Not Authorized' });
    }

    const userId = req.userId;
    try {
        const user = await User.findById(userId).populate('addresses');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'Addresses fetched successfully', addresses: user.addresses });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.add = async (req, res, next) => {
    if (req.userRole !== 'customer') {
        return res.status(403).json({ error: 'Not Authorized' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg });
    }
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { addressLine, country, city, state, postalCode, phone } = req.body;
        const address = {
            addressLine,
            country,
            city,
            state,
            postalCode,
            phone,
        };
        user.addresses.push(address);
        await user.save();
        res.status(201).json({ message: 'Address added successfully', address });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.view = async (req, res, next) => {
    if (req.userRole !== 'customer') {
        return res.status(403).json({ error: 'Not Authorized' });
    }
    const userId = req.userId;
    try {
        const user = await User.findById(userId).populate('addresses');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const addressId = req.params.addressId;
        const address = user.addresses.find((address) => address._id.toString() === addressId);
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        res.status(200).json({ message: 'Address fetched successfully', address });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.update = async (req, res, next) => {
    if (req.userRole !== 'customer') {
        return res.status(403).json({ error: 'Not Authorized' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg });
    }
    const userId = req.userId;
    try {
        const user = await User.findById(userId).populate('addresses');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const addressId = req.params.addressId;
        const address = user.addresses.find((address) => address._id.toString() === addressId);
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        const { addressLine, country, city, state, postalCode, phone } = req.body;
        address.addressLine = addressLine || address.addressLine;
        address.country = country || address.country;
        address.city = city || address.city;
        address.state = state || address.state;
        address.postalCode = postalCode || address.postalCode;
        address.phone = phone || address.phone;
        await user.save();
        res.status(200).json({ message: 'Address updated successfully', address });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.remove = async (req, res, next) => {
    if (req.userRole !== 'customer') {
        return res.status(403).json({ error: 'Not Authorized' });
    }
    const userId = req.userId;
    try {
        const user = await User.findById(userId).populate('addresses');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const addressId = req.params.addressId;
        const address = user.addresses.find((address) => address._id.toString() === addressId);
        if (!address) {
            s
            return res.status(404).json({ error: 'Address not found' });
        }
        user.addresses.pull(addressId);
        await user.save();
        res.status(200).json({ message: 'Address removed successfully', address });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};