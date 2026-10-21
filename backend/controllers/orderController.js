const Order = require("../models/orderModel")
const Product = require("../models/productModel")
const Cart = require("../models/cartModel")
const Address = require("../models/addressModel")
const DeliverySlot = require("../models/deliverySlotModel")
const ErrorHandler = require("../utils/errorHandler")
const asyncError = require("../middleware/asyncError")
const { bookedCounts } = require("./slotController")
const { isBookableDate, isSlotOpen, bookableDates } = require("../utils/deliveryDates")
const { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } = require("../utils/pricing")

// Allowed orderStatus transitions for admins
const STATUS_TRANSITIONS = {
    Placed: ["Packed", "Cancelled"],
    Packed: ["Out for Delivery", "Cancelled"],
    "Out for Delivery": ["Delivered", "Cancelled"],
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
    const { addressId, slotId, deliveryDate } = req.body
    let requestedItems = req.body.orderItems
    let fromCart = false

    // Where and when
    const address = addressId && await Address.findOne({ _id: addressId, user: req.user.id })
    if (!address) return next(new ErrorHandler("Please choose a delivery address", 400))

    if (!isBookableDate(deliveryDate)) {
        const dates = bookableDates()
        return next(new ErrorHandler(`Delivery date must be between ${dates[0]} and ${dates[dates.length - 1]}`, 400))
    }

    const slot = slotId && await DeliverySlot.findOne({ _id: slotId, isActive: true })
    if (!slot) return next(new ErrorHandler("Please choose a delivery slot", 400))
    if (!isSlotOpen(slot, deliveryDate)) return next(new ErrorHandler("That slot is too soon for today, pick a later one", 400))

    const booked = (await bookedCounts(deliveryDate))[slot.id] || 0
    if (booked >= slot.capacity) return next(new ErrorHandler(`The ${slot.label} slot is full on ${deliveryDate}`, 400))

    // What
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
            unit: product.unit,
            quantity,
            image: product.image,
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
    const deliveryFee = itemsPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
    const totalPrice = roundPrice(itemsPrice + deliveryFee)

    let order
    try {
        order = await Order.create({
            shippingInfo: { line1: address.line1, area: address.area, city: address.city, phone: address.phone },
            deliverySlot: { slot: slot._id, label: slot.label, date: deliveryDate },
            orderItems,
            itemsPrice,
            deliveryFee,
            totalPrice,
            user: req.user.id,
            household: req.user.household || null,
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

// Get single order -- owner, their household, or admin
exports.getSingleOrder = asyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user", "name email")

    if (!order) return next(new ErrorHandler("Order not found", 404))

    const isOwner = order.user._id.toString() === req.user.id
    const isHousehold = order.household && req.user.household && order.household.toString() === req.user.household.toString()

    if (!isOwner && !isHousehold && req.user.role !== "admin") {
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

// Cancel own order -- only before it is packed
exports.cancelOrder = asyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) return next(new ErrorHandler("Order not found", 404))

    if (order.user.toString() !== req.user.id) {
        return next(new ErrorHandler("You are not allowed to cancel this order", 403))
    }

    if (order.orderStatus !== "Placed") {
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

// Update order status -- Admin (cash is collected on delivery, so that marks it paid)
exports.updateOrder = asyncError(async (req, res, next) => {
    const { status } = req.body
    const order = await Order.findById(req.params.id)

    if (!order) return next(new ErrorHandler("Order not found", 404))

    if (!STATUS_TRANSITIONS[order.orderStatus].includes(status)) {
        return next(new ErrorHandler(`Cannot change order status from ${order.orderStatus} to ${status}`, 400))
    }

    order.orderStatus = status
    if (status === "Delivered") {
        order.deliveredAt = Date.now()
        order.paidAt = Date.now()
    }

    await order.save()

    if (status === "Cancelled") await restoreStock(order.orderItems)

    await order.populate("user", "name email")

    res.status(200).json({
        success: true,
        order,
    })
})

// Delete order -- Admin (restores stock if the order was still active)
exports.deleteOrder = asyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) return next(new ErrorHandler("Order not found", 404))

    if (["Placed", "Packed", "Out for Delivery"].includes(order.orderStatus)) {
        await restoreStock(order.orderItems)
    }

    await order.deleteOne()

    res.status(200).json({
        success: true,
        message: "Order deleted",
    })
})
