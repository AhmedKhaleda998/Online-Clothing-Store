const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        return res.status(403).json({ error: 'Not Authorized. Token not sent' });
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(403).json({ error: 'Not Authorized. Token has been manipulated' });
    }
    if (!decodedToken) {
        return res.status(401).json({ error: 'Authentication failed' });
    }
    req.userId = decodedToken.userId;
    req.userRole = decodedToken.role;
    next();
};