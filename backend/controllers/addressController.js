const Address = require("../models/addressModel")
const ErrorHandler = require("../utils/errorHandler")
const asyncError = require("../middleware/asyncError")

const pickAddressFields = (body) => {
    const fields = {}
    for (const key of ["label", "line1", "area", "city", "phone", "isDefault"]) {
        if (body[key] !== undefined) fields[key] = body[key]
    }
    return fields
}

// Make this the user's only default address
const setOnlyDefault = async (address) => {
    await Address.updateMany({ user: address.user, _id: { $ne: address._id } }, { $set: { isDefault: false } })
}

const findOwnAddress = async (req, next) => {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id })
    if (!address) next(new ErrorHandler("Address not found", 404))
    return address
}

// Get logged in user's addresses, default first
exports.myAddresses = asyncError(async (req, res, next) => {
    const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 })

    res.status(200).json({
        success: true,
        addresses,
    })
})

// Add an address (the first one becomes the default)
exports.createAddress = asyncError(async (req, res, next) => {
    const existing = await Address.countDocuments({ user: req.user.id })
    if (existing >= 10) return next(new ErrorHandler("You can save up to 10 addresses", 400))

    const fields = pickAddressFields(req.body)
    if (existing === 0) fields.isDefault = true

    const address = await Address.create({ ...fields, user: req.user.id })
    if (address.isDefault) await setOnlyDefault(address)

    res.status(201).json({
        success: true,
        address,
    })
})

exports.updateAddress = asyncError(async (req, res, next) => {
    const address = await findOwnAddress(req, next)
    if (!address) return

    Object.assign(address, pickAddressFields(req.body))
    await address.save()
    if (address.isDefault) await setOnlyDefault(address)

    res.status(200).json({
        success: true,
        address,
    })
})

// Delete an address; if it was the default, the newest remaining one takes over
exports.deleteAddress = asyncError(async (req, res, next) => {
    const address = await findOwnAddress(req, next)
    if (!address) return

    await address.deleteOne()

    if (address.isDefault) {
        await Address.findOneAndUpdate({ user: req.user.id }, { isDefault: true }, { sort: { createdAt: -1 } })
    }

    res.status(200).json({
        success: true,
        message: "Address deleted",
    })
})
