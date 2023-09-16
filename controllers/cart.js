const mongoose = require('mongoose');

const User = require('../models/user');
const Product = require('../models/product');

exports.view = async (req, res) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId).populate('cart.product');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const totalPrice = user.cart.reduce((total, item) => {
            const product = item.product;
            const productPrice = product ? product.price : 0;
            return total + item.quantity * productPrice;
        }, 0);
        res.status(200).json({ message: 'Cart fetched successfully', cart: user.cart, totalPrice: totalPrice });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.addItem = async (req, res) => {
    const { productId } = req.params;
    const { size } = req.body;
    if (!req.body.quantity) {
        req.body.quantity = 1;
    }
    const quantity = req.body.quantity;
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(422).json({ error: 'Product ID is required' });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const existingCartItem = user.cart.find(item => item.product.toString() === productId && item.size === size);
        if (existingCartItem) {
            existingCartItem.quantity += quantity;
        } else {
            user.cart.push({ product: productId, quantity, size });
        }
        await user.save();
        res.status(201).json({ message: 'Product added to cart successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateItem = async (req, res) => {
    const { productId } = req.params;
    const { quantity, size } = req.body;
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(422).json({ error: 'Product ID is required' });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const cartItem = user.cart.find(item => item.product.toString() === productId && item.size === size);
        if (!cartItem) {
            return res.status(404).json({ error: 'Product not found in cart' });
        }
        cartItem.quantity = quantity;
        cartItem.size = size;
        await user.save();
        res.status(200).json({ message: 'Cart item updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.removeItem = async (req, res) => {
    const { productId } = req.params;
    const { size } = req.body;
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(422).json({ error: 'Product ID is required' });
        }
        const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId && item.size === size);
        if (cartItemIndex === -1) {
            return res.status(404).json({ error: 'Product not found in cart' });
        }
        user.cart.splice(cartItemIndex, 1);
        await user.save();
        res.status(200).json({ message: 'Cart item removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};