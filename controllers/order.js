const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const { ulid } = require('ulid');

const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');

exports.viewAll = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json({ message: 'Orders fetched successfully', orders });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.view = async (req, res) => {
    const userId = req.userId;
    try {
        const userOrders = await Order.find({ user: userId });
        res.status(200).json({ message: 'Orders fetched successfully', orders: userOrders });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.checkout = async (req, res) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.cart.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }
        if (!user.addresses || user.addresses.length === 0) {
            return res.status(400).json({ error: 'Address is required' });
        }
        const cartProducts = user.cart;
        let products = [];
        for (const cartItem of cartProducts) {
            const product = await Product.findById(cartItem.product);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            products.push({
                product: cartItem.product,
                name: product.name,
                quantity: cartItem.quantity,
                size: cartItem.size,
                price: product.price,
            });
        }
        if (products.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: products.map(product => ({
                price_data: {
                    currency: 'egp',
                    unit_amount: product.price * 100,
                    product_data: {
                        name: product.name,
                        description: product.size,
                    },
                },
                quantity: product.quantity,
            })),
            mode: 'payment',
            success_url: `${process.env.SERVER_URL}/orders/success?userId=${userId}&sessionId={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.SERVER_URL}/orders/cancel`,
        });
        res.status(200).json({ message: 'Checkout session created successfully', sessionId: session.id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.success = async (req, res) => {
    try {
        const { userId, sessionId } = req.query;
        const user = await User.findById(userId);
        if (!user) {
            return res.redirect(`${process.env.CLIENT_URL}/orders/cancel?error=User not found`);
        }
        if (user.role !== 'customer') {
            return res.redirect(`${process.env.CLIENT_URL}/orders/cancel?error=You are not authorized to perform this action`);
        }
        if (!sessionId) {
            return res.redirect(`${process.env.CLIENT_URL}/orders/cancel?error=Session ID not found`);
        }
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session) {
            return res.redirect(`${process.env.CLIENT_URL}/orders/cancel?error=Session not found`);
        }
        if (session.payment_status !== 'paid') {
            return res.redirect(`${process.env.CLIENT_URL}/orders/cancel?error=Payment not completed`);
        }
        const address = await user.addresses.find(a => a.isDefault);
        if (!address) {
            address = user.addresses[0];
        }
        const cartProducts = user.cart;
        if (cartProducts.length === 0) {
            return res.redirect(`${process.env.CLIENT_URL}/orders/cancel?error=Cart is empty`);
        }
        let products = [];
        let totalAmount = 0;
        for (const cartItem of cartProducts) {
            const product = await Product.findById(cartItem.product);
            if (!product) {
                return res.redirect(`${process.env.CLIENT_URL}/orders/cancel?error=Product not found`);
            }
            const productPrice = product.price * cartItem.quantity;
            totalAmount += productPrice;
            products.push({
                product: cartItem.product,
                name: product.name,
                quantity: cartItem.quantity,
                size: cartItem.size,
                price: productPrice,
            });
        }
        if (products.length === 0 || totalAmount <= 0) {
            return res.redirect(`${process.env.CLIENT_URL}/orders/cancel?error=Cart is empty`);
        }
        const order = new Order({
            number: ulid(),
            user: userId,
            products,
            totalAmount,
            shippingAddress: address,
            paymentIntentId: session.payment_intent,
        });
        user.cart = [];
        await user.save();
        await order.save();
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        const mailOptions = {
            from: process.env.EMAIL_ADDRESS,
            to: user.email,
            subject: 'Order Confirmation',
            html: emailHTML(user, order),
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.redirect(`${process.env.CLIENT_URL}/orders/cancel?error=Email not sent`);
            }
            res.redirect(`${process.env.CLIENT_URL}/orders/success`);
        });
        if (!address || !user.addresses || user.addresses.length === 0) {
            res.redirect(`${process.env.CLIENT_URL}/orders/success?message=Order created successfully. Please add an address to your account to complete the order.`);
        }
        res.redirect(`${process.env.CLIENT_URL}/orders/success`);
    } catch (error) {
        console.log(error);
        res.redirect(`${process.env.CLIENT_URL}/orders/cancel?error=Internal Server Error`);
    }
};

const emailHTML = (user, order) => {
    let orderItemsHTML = '';

    for (const item of order.products) {
        const totalPrice = item.price * item.quantity;
        orderItemsHTML += `
            <tr style="padding: 12px; text-align: center;">
                <td>${item.name}</td>
                <td>${item.size}</td>
                <td>$${item.price}</td>
                <td>${item.quantity}</td>
                <td>$${totalPrice}</td>
            </tr>
        `;
    }

    return `<!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Order Confirmation</title>
            </head> 
            <body>
                <p>Dear ${user.name},</p>
                
                <p>We hope this email finds you well. We are thrilled to inform you that your recent order with us has been successfully processed and confirmed.<br> Thank you for choosing us for your product needs!</p>
                
                <p>Here are the details of your order:</p>
                
                <p><strong>Order Number:</strong> ${order._id}<br>
                    <strong>Order Date:</strong> ${order.createdAt}<br>
                    <strong>Shipping Address:</strong> ${order.shippingAddress.addressLine}</p>
                
                <table>
                    <thead>
                    <tr style="padding: 12px; text-align: center;">
                        <th>Product</th>
                        <th>Size</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total Price</th>
                    </tr>
                    </thead>
                    <tbody>
                        ${orderItemsHTML}
                    </tbody>
                </table>
                
                <p><strong>Total: $${order.totalAmount}</strong></p>

                <p>Your order is now being processed, and we will notify you once it has been shipped. Please allow 5 work days for delivery.<br> If you have any questions or require further assistance, feel free to reply to this email or contact our customer support.</p>
                
                <p>We appreciate your business and look forward to serving you again in the future. Thank you for choosing <strong>Chic Wardrobe!</strong></p>
                
                <p>Best regards,<br><br>
                    Chic Wardrobe<br>
                </p>
            </body>
        </html>
        `;
}

exports.cancel = (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/orders/cancel?error=Payment cancelled`);
}