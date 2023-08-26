const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Product = require('../models/product');
const User = require('../models/user');

exports.viewAll = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.json({ message: 'Products fetched successfully', products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
exports.create = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg });
    }
    if (!req.file) {
        return res.status(422).json({ error: 'Image is required' });
    }
    try {
        let creator;
        const { name, price, size, description, gender, collectionSeason } = req.body;
        const imageUrl = req.file.path.replace("\\", "/");
        const product = new Product({
            name,
            price,
            size: size.split(',').map((s) => s.trim()),
            description,
            gender,
            collectionSeason,
            image: imageUrl,
            creator: req.userId
        });
        await product.save();
        const user = await User.findById(req.userId);
        creator = user;
        user.products.push(product);
        await user.save();
        res.status(201).json({ message: 'Product created successfully', product, creator: { _id: creator._id, name: creator.name } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.view = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Products fetched successfully', product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.update = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg });
    }
    try {
        const productId = req.params.productId;
        const { name, price, size, description, gender, collectionSeason } = req.body;
        let imageUrl;
        const product = await Product.findById(productId).populate('creator');
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (product.creator._id.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not Authorized' });
        }
        if (req.file) {
            imageUrl = req.file.path.replace("\\", "/");
        } else {
            imageUrl = product.image;
        }
        if (imageUrl !== product.image) {
            clearImage(product.image);
        }
        product.name = name;
        product.price = price;
        product.size = size.split(',').map((s) => s.trim());
        product.description = description;
        product.gender = gender;
        product.collectionSeason = collectionSeason;
        product.image = imageUrl;
        await product.save();
        res.json({ message: 'Products updated successfully', product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.delete = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (product.creator._id.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not Authorized' });
        }
        await Product.findByIdAndRemove(productId);
        clearImage(product.image);
        const user = await User.findById(req.userId);
        user.products.pull(productId);
        const users = await User.find();
        for (const user of users) {
            const cartItemsToRemove = user.cart.filter(item => item.product.toString() === productId);
            if (cartItemsToRemove.length > 0) {
                user.cart = user.cart.filter(item => item.product.toString() !== productId);
                await user.save();
            }
        }
        await user.save();
        res.json({ message: 'Product deleted successfully', product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};
