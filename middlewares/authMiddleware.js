const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const UserModel = require('./../model/user/UserModel');

const AuthMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_KEY);

                // Find user by ID
                const user = await UserModel.findById(decoded?.id).select('-password');
                // Exclude the password field from the user object
                if (user) {
                    user.password = undefined;
                }

                req.user = user; // Attach user to the request object
               
                next();
            }
        } catch (error) {
            throw new Error('Not authenticated or token expired. Please login again.');
        }
    } else {
        throw new Error('No authorization header found');
    }
});

module.exports = AuthMiddleware;
