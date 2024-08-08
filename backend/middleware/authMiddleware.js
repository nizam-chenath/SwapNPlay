const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const protect = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    if (!req.session.isLoggedIn) {
        return res.status(401).json({ success: false, message: 'Session authentication failed, please login again.!' });
    }
  
    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('token success', decoded.id);
        // req.user = req.user || {};
        // req.user.id = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = protect;
