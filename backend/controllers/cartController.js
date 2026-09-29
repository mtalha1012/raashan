const Cart = require("../models/cartModel")
const Product = require("../models/productModel")
const ErrorHandler = require("../utils/errorHandler")
const asyncError = require("../middleware/asyncError")

// Populate product info and compute totals from current product prices
const sendCart = async (cart, statusCode, res) => {
    await cart.populate("items.product", "name price stock images")

    // Skip items whose product has since been deleted
    const items = cart.items.filter((item) => item.product)

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0)

    res.status(statusCode).json({
        success: true,
        cart: {
            _id: cart._id,
            user: cart.user,
            items,
            totalItems,
            totalPrice,
            updatedAt: cart.updatedAt,
        }
    })
}

const findOrCreateCart = async (userId) => {
    const cart = await Cart.findOne({ user: userId })
    return cart || Cart.create({ user: userId, items: [] })
}

// Returns a positive integer quantity, or null if invalid
const parseQuantity = (value, fallback) => {
    const quantity = value === undefined ? fallback : Number(value)
    return Number.isInteger(quantity) && quantity >= 1 ? quantity : null
}

// Get logged in user's cart
exports.getCart = asyncError(async (req, res, next) => {
    const cart = await findOrCreateCart(req.user.id)
    await sendCart(cart, 200, res)
})

// Add product to cart (increments quantity if already present)
exports.addToCart = asyncError(async (req, res, next) => {
    const { productId } = req.body
    const quantity = parseQuantity(req.body.quantity, 1)

    if (!productId) return next(new ErrorHandler("Please provide productId", 400))
    if (!quantity) return next(new ErrorHandler("Quantity must be a positive integer", 400))

    const product = await Product.findById(productId)
    if (!product) return next(new ErrorHandler("Product not found", 404))

    const cart = await findOrCreateCart(req.user.id)
    const existingItem = cart.items.find((item) => item.product.toString() === productId)
    const newQuantity = (existingItem ? existingItem.quantity : 0) + quantity

    if (newQuantity > product.stock) {
        return next(new ErrorHandler(`Only ${product.stock} item(s) of ${product.name} in stock`, 400))
    }

    if (existingItem) existingItem.quantity = newQuantity
    else cart.items.push({ product: productId, quantity })

    await cart.save()
    await sendCart(cart, 200, res)
})

// Set quantity of a product in cart
exports.updateCartItem = asyncError(async (req, res, next) => {
    const quantity = parseQuantity(req.body.quantity)
    if (!quantity) return next(new ErrorHandler("Quantity must be a positive integer", 400))

    const cart = await findOrCreateCart(req.user.id)
    const item = cart.items.find((item) => item.product.toString() === req.params.productId)
    if (!item) return next(new ErrorHandler("Product not in cart", 404))

    const product = await Product.findById(req.params.productId)
    if (!product) return next(new ErrorHandler("Product not found", 404))

    if (quantity > product.stock) {
        return next(new ErrorHandler(`Only ${product.stock} item(s) of ${product.name} in stock`, 400))
    }

    item.quantity = quantity
    await cart.save()
    await sendCart(cart, 200, res)
})

// Remove a product from cart
exports.removeFromCart = asyncError(async (req, res, next) => {
    const cart = await findOrCreateCart(req.user.id)
    const itemCount = cart.items.length

    cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId)
    if (cart.items.length === itemCount) return next(new ErrorHandler("Product not in cart", 404))

    await cart.save()
    await sendCart(cart, 200, res)
})

// Empty the cart
exports.clearCart = asyncError(async (req, res, next) => {
    const cart = await findOrCreateCart(req.user.id)
    cart.items = []
    await cart.save()
    await sendCart(cart, 200, res)
})
