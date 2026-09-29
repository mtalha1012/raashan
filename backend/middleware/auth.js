const asyncError = require("./asyncError")
const ErrorHandler = require("../utils/errorHandler")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")

// Accepts the token from the "token" cookie or an "Authorization: Bearer <token>" header
exports.isAuthenticatedUser = asyncError(async (req, res, next) => {
    let token = req.cookies?.token

    const authHeader = req.headers.authorization
    if (!token && authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1]
    }

    if (!token) return next(new ErrorHandler("Please login to access", 401))

    const decodedData = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decodedData.id)

    if (!req.user) return next(new ErrorHandler("User no longer exists", 401))

    next()
})

exports.authorizedRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(`Role ${req.user.role} is not allowed to access this resource`, 403)
            )
        }

        next()
    }
}
