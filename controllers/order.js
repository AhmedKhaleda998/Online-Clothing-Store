const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_KEY);


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

exports.create = async (req, res) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { addressId } = req.body;
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
                name: product.name,
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
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: products.map(p => {
                return {
                    price_data: {
                        currency: 'egp',
                        unit_amount: p.price * 100,
                        product_data: {
                            name: p.name,
                        },
                    },
                    quantity: p.quantity,
                };
            }),
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}`,
            cancel_url: `${process.env.FRONTEND_URL}`,
        });
        // order.paymentIntentId = session.payment_intent;
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
                return res.status(500).send('Internal Server Error');
            }
            res.json({ message: 'Email sent successfully', info });
        });
        res.status(201).json({ message: 'Order created successfully', order, sessionId: session.id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
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