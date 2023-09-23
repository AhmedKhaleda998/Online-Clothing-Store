exports.isCustomer = (req, res, next) => {
    if (req.userRole !== 'customer') {
        return res.status(403).json({ error: 'Not Authorized. You are not a customer' });
    }
    next();
};

exports.isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Not Authorized. You are not an admin' });
    }
    next();
}