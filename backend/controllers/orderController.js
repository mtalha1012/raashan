const Order = require("../models/orderModel")
const Product = require("../models/productModel")
const Cart = require("../models/cartModel")
const ErrorHandler = require("../utils/errorHandler")
const asyncError = require("../middleware/asyncError")

const TAX_RATE = 0.18
const SHIPPING_FEE = 200
const FREE_SHIPPING_THRESHOLD = 1000

// Allowed orderStatus transitions for admins
const STATUS_TRANSITIONS = {
    Processing: ["Shipped", "Cancelled"],
    Shipped: ["Delivered", "Cancelled"],
    Delivered: [],
    Cancelled: [],
}

const roundPrice = (value) => Math.round(value * 100) / 100

// Put the stock of every item in an order back
const restoreStock = async (orderItems) => {
    for (const item of orderItems) {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
    }
}

// Create new order from the request's orderItems, or from the user's cart if none are given.
// Prices are always taken from the database, never from the client.
exports.newOrder = asyncError(async (req, res, next) => {
    const { shippingInfo, paymentInfo } = req.body
    let requestedItems = req.body.orderItems
    let fromCart = false

    if (!requestedItems || requestedItems.length === 0) {
        const cart = await Cart.findOne({ user: req.user.id })
        if (!cart || cart.items.length === 0) {
            return next(new ErrorHandler("No order items provided and cart is empty", 400))
        }
        requestedItems = cart.items.map((item) => ({ product: item.product.toString(), quantity: item.quantity }))
        fromCart = true
    }

    if (!Array.isArray(requestedItems)) {
        return next(new ErrorHandler("orderItems must be an array", 400))
    }

    // Build order items from current product data
    const orderItems = []
    for (const item of requestedItems) {
        const quantity = Number(item.quantity)
        if (!Number.isInteger(quantity) || quantity < 1) {
            return next(new ErrorHandler("Quantity must be a positive integer", 400))
        }

        const product = await Product.findById(item.product)
        if (!product) return next(new ErrorHandler(`Product not found: ${item.product}`, 404))

        orderItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.images[0]?.url,
        })
    }

    // Reserve stock atomically; roll back already reserved items if one fails
    const reserved = []
    for (const item of orderItems) {
        const updated = await Product.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } }
        )

        if (!updated) {
            await restoreStock(reserved)
            return next(new ErrorHandler(`Not enough stock for ${item.name}`, 400))
        }
        reserved.push(item)
    }

    const itemsPrice = roundPrice(orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0))
    const taxPrice = roundPrice(itemsPrice * TAX_RATE)
    const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
    const totalPrice = roundPrice(itemsPrice + taxPrice + shippingPrice)

    let order
    try {
        order = await Order.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            paidAt: paymentInfo?.status === "succeeded" ? Date.now() : undefined,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            user: req.user.id,
        })
    } catch (error) {
        await restoreStock(reserved)
        throw error
    }

    if (fromCart) {
        await Cart.updateOne({ user: req.user.id }, { $set: { items: [] } })
    }

    res.status(201).json({
        success: true,
        order,
    })
})

// Get single order -- owner or admin
exports.getSingleOrder = asyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user", "name email")

    if (!order) return next(new ErrorHandler("Order not found", 404))

    if (order.user._id.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorHandler("You are not allowed to view this order", 403))
    }

    res.status(200).json({
        success: true,
        order,
    })
})

// Get logged in user's orders
exports.myOrders = asyncError(async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 })

    res.status(200).json({
        success: true,
        orders,
    })
})

// Cancel own order -- only while it is still processing
exports.cancelOrder = asyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) return next(new ErrorHandler("Order not found", 404))

    if (order.user.toString() !== req.user.id) {
        return next(new ErrorHandler("You are not allowed to cancel this order", 403))
    }

    if (order.orderStatus !== "Processing") {
        return next(new ErrorHandler(`Order is already ${order.orderStatus.toLowerCase()} and cannot be cancelled`, 400))
    }

    order.orderStatus = "Cancelled"
    await order.save()
    await restoreStock(order.orderItems)

    res.status(200).json({
        success: true,
        order,
    })
})

// Get all orders -- Admin
exports.getAllOrders = asyncError(async (req, res, next) => {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 })

    const totalAmount = roundPrice(
        orders
        .filter((order) => order.orderStatus !== "Cancelled")
        .reduce((sum, order) => sum + order.totalPrice, 0)
    )

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    })
})

// Update order status -- Admin
exports.updateOrder = asyncError(async (req, res, next) => {
    const { status } = req.body
    const order = await Order.findById(req.params.id)

    if (!order) return next(new ErrorHandler("Order not found", 404))

    if (!STATUS_TRANSITIONS[order.orderStatus].includes(status)) {
        return next(new ErrorHandler(`Cannot change order status from ${order.orderStatus} to ${status}`, 400))
    }

    order.orderStatus = status
    if (status === "Delivered") order.deliveredAt = Date.now()

    await order.save()

    if (status === "Cancelled") await restoreStock(order.orderItems)

    res.status(200).json({
        success: true,
        order,
    })
})

// Delete order -- Admin (restores stock if the order was still active)
exports.deleteOrder = asyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) return next(new ErrorHandler("Order not found", 404))

    if (["Processing", "Shipped"].includes(order.orderStatus)) {
        await restoreStock(order.orderItems)
    }

    await order.deleteOne()

    res.status(200).json({
        success: true,
        message: "Order deleted",
    })
})
