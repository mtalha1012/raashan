const Product = require("../models/productModel")
const Category = require("../models/categoryModel")
const Cart = require("../models/cartModel")
const ListItem = require("../models/listItemModel")
const ErrorHandler = require("../utils/errorHandler")
const asyncError = require("../middleware/asyncError")
const ApiFeatures = require("../utils/apifeatures")

const CATEGORY_FIELDS = "name icon"

// Aliases can be an array or comma separated string
const cleanAliases = (aliases) => {
    if (aliases === undefined) return undefined
    const list = Array.isArray(aliases) ? aliases : String(aliases).split(",")
    return [...new Set(list.map((alias) => String(alias).trim().toLowerCase()).filter(Boolean))]
}

const checkCategory = async (categoryId, next) => {
    const category = await Category.findById(categoryId)
    if (!category) {
        next(new ErrorHandler("Category not found", 404))
        return false
    }
    return true
}

// Create product -- Admin
exports.createProduct = asyncError (async (req, res, next) => {
    if (!req.body.category) return next(new ErrorHandler("Please enter category", 400))
    if (!(await checkCategory(req.body.category, next))) return

    req.body.user = req.user.id
    req.body.aliases = cleanAliases(req.body.aliases)
    const product = await Product.create(req.body)
    await product.populate("category", CATEGORY_FIELDS)

    res.status(201).json({
        success:true,
        product
    })
})

// Get all products
exports.getAllProducts = asyncError (async (req, res) => {
    const resultPerPage = 12
    const productCount = await Product.countDocuments()

    const filteredQuery = new ApiFeatures(Product.find(), req.query).search().filter()
    const filteredProductCount = await filteredQuery.query.clone().countDocuments()

    const apiFeatures = new ApiFeatures(Product.find().sort({ name: 1 }), req.query)
    .search()
    .filter()
    .pagination(resultPerPage)
    const products = await apiFeatures.query.populate("category", CATEGORY_FIELDS)
    res.status(200).json({
        success: true,
        products,
        productCount,
        filteredProductCount,
        resultPerPage,
    })
})

// Get all products without pagination -- Admin
exports.getAdminProducts = asyncError (async (req, res) => {
    const products = await Product.find().sort({ name: 1 }).populate("category", CATEGORY_FIELDS)

    res.status(200).json({
        success: true,
        products,
    })
})

// Update product -- Admin
exports.updateProduct = asyncError (async (req, res, next) => {
    let product = await Product.findById(req.params.id)
    if(!product) return next(new ErrorHandler("Product not found", 404))

    if (req.body.category && !(await checkCategory(req.body.category, next))) return

    // The product owner can't be changed through this route
    delete req.body.user
    if (req.body.aliases !== undefined) req.body.aliases = cleanAliases(req.body.aliases)

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        returnDocument: "after",
        runValidators:true,
    }).populate("category", CATEGORY_FIELDS)

    res.status(200).json({
        success:true,
        product
    })
})

// Delete product -- Admin (also removes it from carts and lists)
exports.deleteProduct = asyncError (async (req, res, next) => {
    const product = await Product.findById(req.params.id)
    if (!product) return next(new ErrorHandler("Product not found", 404))

    await product.deleteOne()
    await Cart.updateMany({}, { $pull: { items: { product: product._id } } })
    await ListItem.updateMany({ product: product._id }, { $set: { product: null } })

    res.status(200).json({
        success:true,
        message: "Product deleted"
    })
})

exports.getProductDetails = asyncError (async (req, res, next) => {
    const product = await Product.findById(req.params.id).populate("category", CATEGORY_FIELDS)
    if (!product) return next(new ErrorHandler("Product not found", 404))

    res.status(200).json({
        success:true,
        product
    })
});
