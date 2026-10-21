const crypto = require("crypto")
const Household = require("../models/householdModel")
const ListItem = require("../models/listItemModel")
const Order = require("../models/orderModel")
const User = require("../models/userModel")
const ErrorHandler = require("../utils/errorHandler")
const asyncError = require("../middleware/asyncError")

// No 0/O or 1/I to avoid confusion
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const MAX_MEMBERS = 12

const generateInviteCode = async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
        const code = Array.from(crypto.randomBytes(6), (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("")
        if (!(await Household.exists({ inviteCode: code }))) return code
    }
    throw new ErrorHandler("Could not generate an invite code, please try again", 500)
}

const sendHousehold = async (household, statusCode, res) => {
    await household.populate("members.user", "name email")

    res.status(statusCode).json({
        success: true,
        household,
    })
}

// Delete household with its list
const destroyHousehold = async (household) => {
    await ListItem.deleteMany({ household: household._id })
    await User.updateMany({ household: household._id }, { $set: { household: null } })
    await household.deleteOne()
}

// Remove user from household (empty household gets deleted)
const removeFromHousehold = async (user) => {
    const household = user.household && await Household.findById(user.household)

    if (household) {
        household.members = household.members.filter((member) => member.user.toString() !== user.id)

        if (household.members.length === 0) {
            await destroyHousehold(household)
        } else {
            if (household.owner.toString() === user.id) household.owner = household.members[0].user
            await household.save()
        }
    }

    user.household = null
    await user.save({ validateBeforeSave: false })
}

exports.removeFromHousehold = removeFromHousehold

// Get logged in user's household (null if they have none)
exports.getMyHousehold = asyncError(async (req, res, next) => {
    const household = req.user.household && await Household.findById(req.user.household)

    if (!household) {
        return res.status(200).json({ success: true, household: null })
    }

    await sendHousehold(household, 200, res)
})

// Create household
exports.createHousehold = asyncError(async (req, res, next) => {
    if (req.user.household) return next(new ErrorHandler("You are already in a household. Leave it first", 400))

    const household = await Household.create({
        name: req.body.name,
        inviteCode: await generateInviteCode(),
        owner: req.user.id,
        members: [{ user: req.user.id, nickname: req.body.nickname || req.user.name }],
    })

    req.user.household = household._id
    await req.user.save({ validateBeforeSave: false })

    await sendHousehold(household, 201, res)
})

// Join household with invite code
exports.joinHousehold = asyncError(async (req, res, next) => {
    if (req.user.household) return next(new ErrorHandler("You are already in a household. Leave it first", 400))

    const inviteCode = String(req.body.inviteCode || "").trim().toUpperCase()
    if (!inviteCode) return next(new ErrorHandler("Please enter an invite code", 400))

    const household = await Household.findOne({ inviteCode })
    if (!household) return next(new ErrorHandler("No household found with that invite code", 404))

    if (household.members.length >= MAX_MEMBERS) {
        return next(new ErrorHandler(`A household can have at most ${MAX_MEMBERS} members`, 400))
    }

    household.members.push({ user: req.user.id, nickname: req.body.nickname || req.user.name })
    await household.save()

    req.user.household = household._id
    await req.user.save({ validateBeforeSave: false })

    await sendHousehold(household, 200, res)
})

// Rename household -- Owner
exports.updateHousehold = asyncError(async (req, res, next) => {
    if (req.body.name !== undefined) req.household.name = req.body.name
    await req.household.save()

    await sendHousehold(req.household, 200, res)
})

// Update own nickname
exports.updateNickname = asyncError(async (req, res, next) => {
    const member = req.household.members.find((member) => member.user.toString() === req.user.id)
    member.nickname = req.body.nickname || req.user.name
    await req.household.save()

    await sendHousehold(req.household, 200, res)
})

// New invite code -- Owner
exports.regenerateInviteCode = asyncError(async (req, res, next) => {
    req.household.inviteCode = await generateInviteCode()
    await req.household.save()

    await sendHousehold(req.household, 200, res)
})

// Remove member -- Owner
exports.removeMember = asyncError(async (req, res, next) => {
    if (req.params.userId === req.user.id) {
        return next(new ErrorHandler("Use leave household to remove yourself", 400))
    }

    const memberCount = req.household.members.length
    req.household.members = req.household.members.filter((member) => member.user.toString() !== req.params.userId)

    if (req.household.members.length === memberCount) {
        return next(new ErrorHandler("That user is not in your household", 404))
    }

    await req.household.save()
    await User.updateOne({ _id: req.params.userId }, { $set: { household: null } })

    await sendHousehold(req.household, 200, res)
})

// Leave household
exports.leaveHousehold = asyncError(async (req, res, next) => {
    await removeFromHousehold(req.user)

    res.status(200).json({
        success: true,
        message: "You left the household",
    })
})

// Delete household -- Owner
exports.deleteHousehold = asyncError(async (req, res, next) => {
    await destroyHousehold(req.household)

    res.status(200).json({
        success: true,
        message: "Household deleted",
    })
})

// Get household orders
exports.householdOrders = asyncError(async (req, res, next) => {
    const orders = await Order.find({ household: req.household._id })
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .limit(30)

    res.status(200).json({
        success: true,
        orders,
    })
})
