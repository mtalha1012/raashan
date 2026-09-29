const express = require("express");
const app = express();
const errorMiddleware = require("./middleware/error")
const ErrorHandler = require("./utils/errorHandler")
const cookieParser = require("cookie-parser")

// Parse nested query strings like ?price[gte]=100 (Express 5 defaults to the simple parser)
app.set("query parser", "extended")

app.use(express.json())
app.use(cookieParser())

// Route imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute")
const cart = require("./routes/cartRoute")
const order = require("./routes/orderRoute")

app.use("/api/v1", product);
app.use("/api/v1", user)
app.use("/api/v1", cart)
app.use("/api/v1", order)

// Unknown routes
app.use((req, res, next) => {
    next(new ErrorHandler(`Route ${req.method} ${req.originalUrl} not found`, 404))
})

// Midlleware for error
app.use(errorMiddleware)

module.exports = app
