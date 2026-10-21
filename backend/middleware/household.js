const asyncError = require("./asyncError")
const ErrorHandler = require("../utils/errorHandler")
const Household = require("../models/householdModel")

// Loads the logged in user's household into req.household; use after isAuthenticatedUser
exports.requireHousehold = asyncError(async (req, res, next) => {
    const household = req.user.household && await Household.findById(req.user.household)

    if (!household) return next(new ErrorHandler("Create or join a household first", 400))

    req.household = household
    next()
})

// Only the household owner may continue
exports.requireHouseholdOwner = (req, res, next) => {
    if (req.household.owner.toString() !== req.user.id) {
        return next(new ErrorHandler("Only the household owner can do this", 403))
    }

    next()
}
