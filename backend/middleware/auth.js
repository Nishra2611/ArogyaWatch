const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        if (process.env.JWT_SECRET === 'supersecretkey_arogyawatch_2026' || !process.env.DB_CONNECTION_STRING) {
            // Updated mock user to match new id/role structure
            req.user = { id: 1, role: 'STAFF', center_id: 1, username: 'demo_staff' };
            return next();
        }
        return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_arogyawatch_2026');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token verification failed, authorization denied' });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden: Role '${req.user.role}' does not have access to this resource`
            });
        }
        next();
    };
};

module.exports = { authenticateToken, authorizeRoles };
