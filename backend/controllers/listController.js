const ListItem = require("../models/listItemModel")
const Product = require("../models/productModel")
const Cart = require("../models/cartModel")
const ErrorHandler = require("../utils/errorHandler")
const asyncError = require("../middleware/asyncError")
const { parseList } = require("../utils/listParser")

const MAX_LIST_ITEMS = 150
const MAX_BULK_ITEMS = 50
const PRODUCT_FIELDS = "name price unit stock image category"

const myNickname = (req) => {
    const member = req.household.members.find((member) => member.user.toString() === req.user.id)
    return member?.nickname || req.user.name
}

// Only the fields the parser needs
const loadProducts = () => Product.find().select("name aliases unit price stock image category").lean()

const parseQuantity = (value, fallback) => {
    const quantity = value === undefined ? fallback : Number(value)
    return Number.isInteger(quantity) && quantity >= 1 && quantity <= 99 ? quantity : null
}

const checkRoom = async (household, adding, next) => {
    const count = await ListItem.countDocuments({ household: household._id })
    if (count + adding > MAX_LIST_ITEMS) {
        next(new ErrorHandler(`A list can hold ${MAX_LIST_ITEMS} items. Clear the ticked ones first`, 400))
        return false
    }
    return true
}

const findOwnItem = async (req, next) => {
    const item = await ListItem.findOne({ _id: req.params.id, household: req.household._id })
    if (!item) next(new ErrorHandler("List item not found", 404))
    return item
}

// Get household list: open items first, newest first
exports.getList = asyncError(async (req, res, next) => {
    const items = await ListItem.find({ household: req.household._id })
    .populate("product", PRODUCT_FIELDS)
    .sort({ done: 1, createdAt: -1 })

    res.status(200).json({
        success: true,
        items,
    })
})

// Add one item, by productId or by free text (text is matched to a product when possible)
exports.addItem = asyncError(async (req, res, next) => {
    const { productId, text } = req.body
    const quantity = parseQuantity(req.body.quantity, 1)
    if (!quantity) return next(new ErrorHandler("Quantity must be a whole number from 1 to 99", 400))

    let product = null
    let itemText = String(text || "").trim()

    if (productId) {
        product = await Product.findById(productId)
        if (!product) return next(new ErrorHandler("Product not found", 404))
        if (!itemText) itemText = product.name
    } else {
        if (!itemText) return next(new ErrorHandler("Please enter an item or choose a product", 400))
        const [parsed] = parseList(itemText, await loadProducts())
        product = parsed?.product || null
    }

    if (!(await checkRoom(req.household, 1, next))) return

    const item = await ListItem.create({
        household: req.household._id,
        text: itemText,
        product: product?._id || null,
        quantity,
        addedBy: req.user.id,
        requestedBy: req.body.requestedBy || myNickname(req),
    })
    await item.populate("product", PRODUCT_FIELDS)

    res.status(201).json({
        success: true,
        item,
    })
})

// Preview what a pasted WhatsApp message turns into -- nothing is saved
exports.parseMessage = asyncError(async (req, res, next) => {
    const message = String(req.body.message || "")
    if (!message.trim()) return next(new ErrorHandler("Please paste a message", 400))
    if (message.length > 5000) return next(new ErrorHandler("Message is too long (5000 characters max)", 400))

    const items = parseList(message, await loadProducts()).slice(0, MAX_BULK_ITEMS)

    res.status(200).json({
        success: true,
        matched: items.filter((item) => item.product).length,
        items,
    })
})

// Save the confirmed preview: [{ text, productId, quantity, requestedBy }]
exports.addItems = asyncError(async (req, res, next) => {
    const { items } = req.body
    if (!Array.isArray(items) || items.length === 0) return next(new ErrorHandler("No items to add", 400))
    if (items.length > MAX_BULK_ITEMS) return next(new ErrorHandler(`You can add up to ${MAX_BULK_ITEMS} items at once`, 400))

    const productIds = items.map((item) => item.productId).filter(Boolean)
    const products = await Product.find({ _id: { $in: productIds } }).select("_id")
    const knownIds = new Set(products.map((product) => product.id))

    const docs = []
    for (const item of items) {
        const quantity = parseQuantity(item.quantity, 1)
        if (!quantity) return next(new ErrorHandler("Quantity must be a whole number from 1 to 99", 400))
        if (!String(item.text || "").trim()) return next(new ErrorHandler("Every item needs a name", 400))

        docs.push({
            household: req.household._id,
            text: String(item.text).trim().slice(0, 80),
            product: knownIds.has(String(item.productId)) ? item.productId : null,
            quantity,
            addedBy: req.user.id,
            requestedBy: String(item.requestedBy || myNickname(req)).slice(0, 25),
        })
    }

    if (!(await checkRoom(req.household, docs.length, next))) return

    const created = await ListItem.insertMany(docs)

    res.status(201).json({
        success: true,
        added: created.length,
    })
})

// Update quantity, text, linked product or ticked state
exports.updateItem = asyncError(async (req, res, next) => {
    const item = await findOwnItem(req, next)
    if (!item) return

    if (req.body.quantity !== undefined) {
        const quantity = parseQuantity(req.body.quantity)
        if (!quantity) return next(new ErrorHandler("Quantity must be a whole number from 1 to 99", 400))
        item.quantity = quantity
    }

    if (req.body.text !== undefined) item.text = req.body.text
    if (req.body.done !== undefined) item.done = Boolean(req.body.done)

    if (req.body.productId !== undefined) {
        if (req.body.productId && !(await Product.exists({ _id: req.body.productId }))) {
            return next(new ErrorHandler("Product not found", 404))
        }
        item.product = req.body.productId || null
    }

    await item.save()
    await item.populate("product", PRODUCT_FIELDS)

    res.status(200).json({
        success: true,
        item,
    })
})

exports.deleteItem = asyncError(async (req, res, next) => {
    const item = await findOwnItem(req, next)
    if (!item) return

    await item.deleteOne()

    res.status(200).json({
        success: true,
        message: "Item removed",
    })
})

// Remove every ticked item
exports.clearDone = asyncError(async (req, res, next) => {
    const result = await ListItem.deleteMany({ household: req.household._id, done: true })

    res.status(200).json({
        success: true,
        removed: result.deletedCount,
    })
})

// Put every open, linked item into my cart (as much as stock allows) and tick it off
exports.moveToCart = asyncError(async (req, res, next) => {
    const items = await ListItem.find({ household: req.household._id, done: false }).populate("product")

    const cart = await Cart.findOne({ user: req.user.id }) || await Cart.create({ user: req.user.id, items: [] })
    const moved = []
    const skipped = []

    for (const item of items) {
        if (!item.product) {
            skipped.push({ text: item.text, reason: "Not linked to a product" })
            continue
        }

        const cartItem = cart.items.find((cartItem) => cartItem.product.toString() === item.product.id)
        const inCart = cartItem ? cartItem.quantity : 0
        const canAdd = Math.min(item.quantity, item.product.stock - inCart)

        if (canAdd <= 0) {
            skipped.push({ text: item.text, reason: `${item.product.name} is out of stock` })
            continue
        }

        if (cartItem) cartItem.quantity += canAdd
        else cart.items.push({ product: item.product._id, quantity: canAdd })

        moved.push({ text: item.text, name: item.product.name, quantity: canAdd, requested: item.quantity })
        item.done = true
        await item.save()
    }

    await cart.save()

    res.status(200).json({
        success: true,
        moved,
        skipped,
    })
})
