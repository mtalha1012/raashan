const express = require("express");
const path = require("path")
const app = express();
const errorMiddleware = require("./middleware/error")
const ErrorHandler = require("./utils/errorHandler")
const cookieParser = require("cookie-parser")

// Parse nested query strings like ?price[gte]=100 (Express 5 defaults to the simple parser)
app.set("query parser", "extended")

// Needed behind Render's proxy
app.set("trust proxy", 1)

app.use(express.json({ limit: "100kb" }))
app.use(cookieParser())

// Route imports
const product = require("./routes/productRoute");
const category = require("./routes/categoryRoute")
const user = require("./routes/userRoute")
const cart = require("./routes/cartRoute")
const order = require("./routes/orderRoute")
const address = require("./routes/addressRoute")
const slot = require("./routes/slotRoute")
const household = require("./routes/householdRoute")

app.get("/api/v1/health", (req, res) => res.status(200).json({ success: true }))

app.use("/api/v1", product);
app.use("/api/v1", category)
app.use("/api/v1", user)
app.use("/api/v1", cart)
app.use("/api/v1", order)
app.use("/api/v1", address)
app.use("/api/v1", slot)
app.use("/api/v1", household)

// Serve React build in production
if (process.env.NODE_ENV === "production") {
    const clientPath = path.join(__dirname, "../frontend/dist")
    app.use(express.static(clientPath))

    // Send all non API routes to React
    app.get(/^(?!\/api\/).*/, (req, res) => {
        res.sendFile(path.join(clientPath, "index.html"))
    })
}

// Unknown routes
app.use((req, res, next) => {
    next(new ErrorHandler(`Route ${req.method} ${req.originalUrl} not found`, 404))
})

// Midlleware for error
app.use(errorMiddleware)

module.exports = app
