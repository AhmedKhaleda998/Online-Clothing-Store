const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');

exports.view = async (req, res) => {
    if (req.userRole !== 'customer') {
        return res.status(403).json({ error: 'Not Authorized' });
    }
    const userId = req.userId;
    try {
        const userOrders = await Order.find({ user: userId });
        res.status(200).json({ message: 'Orders fetched successfully', orders: userOrders });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.create = async (req, res) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const addressId = req.body.addressId;
        const address = user.addresses.find((address) => address._id.toString() === addressId);
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        const cartProducts = user.cart;
        let products = [];
        let totalAmount = 0;
        for (const cartItem of cartProducts) {
            const product = await Product.findById(cartItem.product);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            const productPrice = product.price * cartItem.quantity;
            totalAmount += productPrice;
            products.push({
                product: cartItem.product,
                quantity: cartItem.quantity,
                size: cartItem.size,
                price: productPrice,
            });
        }
        const order = new Order({
            user: userId,
            products,
            totalAmount,
            shippingAddress: address,
        });
        user.cart = [];
        await user.save();
        await order.save();
        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
