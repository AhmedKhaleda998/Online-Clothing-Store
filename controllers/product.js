const fs = require('fs');
const path = require('path');

const mongoose = require('mongoose');

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
        clearImage(req.file.path.replace("\\", "/"));
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
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(422).json({ error: 'Product ID is required' });
        }
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
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(422).json({ error: 'Product ID is required' });
        }
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
        product.name = name || product.name;
        product.price = price;
        product.size = size.split(',').map((s) => s.trim()) || product.size;
        product.description = description || product.description;
        product.gender = gender || product.gender;
        product.collectionSeason = collectionSeason || product.collectionSeason;
        product.image = imageUrl || product.image;
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
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(422).json({ error: 'Product ID is required' });
        }
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

exports.search = async (req, res, next) => {
    try {
        const keyword = req.query.keyword || '';
        const results = await Product.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { gender: { $regex: keyword, $options: 'i' } },
                { collectionSeason: { $regex: keyword, $options: 'i' } },
            ],
        });
        res.json({ message: 'Products fetched successfully', keyword, products: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.filter = async (req, res, next) => {
    try {
        const keyword = req.params.keyword || '';
        const results = await Product.find({
            $or: [
                { gender: { $regex: keyword, $options: 'i' } },
                { collectionSeason: { $regex: keyword, $options: 'i' } },
            ],
        });
        res.json({ message: 'Products fetched successfully', collection: keyword, products: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};
