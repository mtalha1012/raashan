const Product = require("../models/productModel")
const ErrorHandler = require("../utils/errorHandler") 
const asyncError = require("../middleware/asyncError")
const ApiFeatures = require("../utils/apifeatures")

// Create product
exports.createProduct = asyncError (async (req, res, next) => {
    req.body.user = req.user.id
    const product = await Product.create(req.body)

    res.status(201).json({
        success:true,
        product
    })
})

exports.getAllProducts = asyncError (async (req, res) => {
    const resultPerPage = 5
    const productCount = await Product.countDocuments()

    const filteredQuery = new ApiFeatures(Product.find(), req.query).search().filter()
    const filteredProductCount = await filteredQuery.query.clone().countDocuments()

    const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage)
    const products = await apiFeatures.query
    res.status(200).json({
        success: true,
        products,
        productCount,
        filteredProductCount,
        resultPerPage,
    })
})

exports.updateProduct = asyncError (async (req, res, next) => {
    let product = await Product.findById(req.params.id)
    if(!product) return next(new ErrorHandler("Product not found", 404))

    // The product owner can't be changed through this route
    delete req.body.user

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        returnDocument: "after",
        runValidators:true,
    })

    res.status(200).json({
        success:true,
        product
    })
})

exports.deleteProduct = asyncError (async (req, res, next) => {
    const product = await Product.findById(req.params.id)
    if (!product) return next(new ErrorHandler("Product not found", 404))

    await product.deleteOne()
    res.status(200).json({
        success:true,
        message: "Product deleted"
    })
})

exports.getProductDetails = asyncError (async (req, res, next) => {
    const product = await Product.findById(req.params.id)
     if (!product) return next(new ErrorHandler("Product not found", 404))

    res.status(200).json({
        success:true,
        product
    })
});