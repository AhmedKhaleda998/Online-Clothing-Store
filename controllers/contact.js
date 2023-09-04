const nodemailer = require('nodemailer');

const { validationResult } = require('express-validator');

exports.send = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg });
    }
    try {
        const { name, email, phone, message } = req.body;
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        const mailOptions = {
            from: process.env.EMAIL_ADDRESS,
            to: email,
            subject: 'Contact Form Submission Confirmation',
            html: emailHTML(name, email, phone, message),
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Internal Server Error');
            }
            res.json({ message: 'Email sent successfully', info });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const emailHTML = (name, email, phone, message) => {
    return `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Contact Confirmation</title>
        </head>
        <body>
            <h2>Thank you for contacting us!</h2>
            <p>We have received your message and will get back to you as soon as possible.</p>
            <p>Here are the details of your submission:</p>
            
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Phone:</strong> ${phone}</li>
                <li><strong>Message:</strong> ${message}</li>
            </ul>
            
            <p>If you have any further questions or concerns, please feel free to reach out to us.</p>
            
            <p>Best regards,<br><br>
                Chic Wardrobe<br>
            </p>
        </body>
    </html>`;
};