const Category = require("../models/categoryModel")
const Product = require("../models/productModel")
const ErrorHandler = require("../utils/errorHandler")
const asyncError = require("../middleware/asyncError")

// Fields an admin is allowed to set
const pickCategoryFields = (body) => {
    const fields = {}
    for (const key of ["name", "icon", "description", "sortOrder"]) {
        if (body[key] !== undefined) fields[key] = body[key]
    }
    return fields
}

// Get all categories with how many products each has
exports.getAllCategories = asyncError(async (req, res, next) => {
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 }).lean()

    const counts = await Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }])
    const countById = Object.fromEntries(counts.map((row) => [String(row._id), row.count]))

    res.status(200).json({
        success: true,
        categories: categories.map((category) => ({
            ...category,
            productCount: countById[String(category._id)] || 0,
        })),
    })
})

exports.getCategory = asyncError(async (req, res, next) => {
    const category = await Category.findById(req.params.id)
    if (!category) return next(new ErrorHandler("Category not found", 404))

    res.status(200).json({
        success: true,
        category,
    })
})

// Create category -- Admin
exports.createCategory = asyncError(async (req, res, next) => {
    const category = await Category.create(pickCategoryFields(req.body))

    res.status(201).json({
        success: true,
        category,
    })
})

// Update category -- Admin
exports.updateCategory = asyncError(async (req, res, next) => {
    const category = await Category.findByIdAndUpdate(req.params.id, pickCategoryFields(req.body), {
        returnDocument: "after",
        runValidators: true,
    })

    if (!category) return next(new ErrorHandler("Category not found", 404))

    res.status(200).json({
        success: true,
        category,
    })
})

// Delete category -- Admin (only when no product uses it)
exports.deleteCategory = asyncError(async (req, res, next) => {
    const category = await Category.findById(req.params.id)
    if (!category) return next(new ErrorHandler("Category not found", 404))

    const productCount = await Product.countDocuments({ category: category._id })
    if (productCount > 0) {
        return next(new ErrorHandler(`Move or delete the ${productCount} product(s) in ${category.name} first`, 400))
    }

    await category.deleteOne()

    res.status(200).json({
        success: true,
        message: "Category deleted",
    })
})
