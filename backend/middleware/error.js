const ErrorHandler = require("../utils/errorHandler")

module.exports = (err, req, res, next) => {
    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        err = new ErrorHandler(`Resource not found. Invalid ${err.path}`, 400)
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((e) => e.message).join(", ")
        err = new ErrorHandler(message, 400)
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
        err = new ErrorHandler(`Duplicate ${Object.keys(err.keyValue).join(", ")} entered`, 400)
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        err = new ErrorHandler("Invalid token, please login again", 401)
    }

    if (err.name === "TokenExpiredError") {
        err = new ErrorHandler("Token has expired, please login again", 401)
    }

    // Malformed JSON body
    if (err.type === "entity.parse.failed") {
        err = new ErrorHandler("Invalid JSON in request body", 400)
    }

    const statusCode = err.statusCode || 500

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    })
}
