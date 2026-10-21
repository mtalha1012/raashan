const asyncError = require("../middleware/asyncError")
const User = require("../models/userModel")
const ErrorHandler = require("../utils/errorHandler")
const sendToken = require("../utils/jwtToken")
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto")
const { removeFromHousehold } = require("./householdController")

exports.registerUser = asyncError(async (req, res, next) => {
    const {name, email, password, phone} = req.body
    const user = await User.create({ name, email, password, phone })

    sendToken(user, 201, res)
})

exports.loginUser = asyncError(async (req, res, next) => {
    const {email, password} = req.body

    if (!email || !password) return next(
        new ErrorHandler("Please enter email and password", 400)
    )

    const user = await User.findOne({ email }).select("+password")

    if (!user) return next(
        new ErrorHandler("Invalid email or password", 401)
    )

    const isPasswordMatched = await user.comparePassword(password)

    if (!isPasswordMatched) return next(
        new ErrorHandler("Invalid email or password", 401)
    )

    sendToken(user, 200, res)
})

// logout
exports.logout = asyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    })
    
    res.status(200).json({
        success: true,
        message: "Logged out",
    })
})

exports.forgotPassword = asyncError(async (req, res, next) => {
    const user = await User.findOne({email:req.body.email})

    if (!user) {
        return next(new ErrorHandler("User not found", 404))
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken()

    await user.save({
        validateBeforeSave: false
    })

    // Reset link opens the frontend
    const clientUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`
    const resetPasswordUrl = `${clientUrl}/password/reset/${resetToken}`
    const message = `Your password reset token is \n\n ${resetPasswordUrl} \n\n If you have not requested this email, 
    then please ignore it`

    try {
        await sendEmail({
            email:user.email,
            subject: `Raashan password recovery`,
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({ validateBeforeSave: false })

        return next(
            new ErrorHandler("Email could not be sent. Please try again later.", 500)
        )
    }

})

// Reset password using the token sent by email
exports.resetPassword = asyncError(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256")
    .update(req.params.token)
    .digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
        return next(new ErrorHandler("Reset password token is invalid or has expired", 400))
    }

    if (!req.body.password || req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password and confirm password do not match", 400))
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    sendToken(user, 200, res)
})

// Get logged in user's details
exports.getUserDetails = asyncError(async (req, res, next) => {
    res.status(200).json({
        success: true,
        user: req.user,
    })
})

// Update logged in user's password
exports.updatePassword = asyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password")

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword || "")

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400))
    }

    if (!req.body.newPassword || req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password and confirm password do not match", 400))
    }

    user.password = req.body.newPassword
    await user.save()

    sendToken(user, 200, res)
})

// Update logged in user's profile
exports.updateProfile = asyncError(async (req, res, next) => {
    const newUserData = {}
    if (req.body.name) newUserData.name = req.body.name
    if (req.body.email) newUserData.email = req.body.email
    if (req.body.phone !== undefined) newUserData.phone = req.body.phone

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        returnDocument: "after",
        runValidators: true,
    })

    res.status(200).json({
        success: true,
        user,
    })
})

// Get all users -- Admin
exports.getAllUsers = asyncError(async (req, res, next) => {
    const users = await User.find()

    res.status(200).json({
        success: true,
        users,
    })
})

// Get single user -- Admin
exports.getSingleUser = asyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        user,
    })
})

// Update user role -- Admin
exports.updateUserRole = asyncError(async (req, res, next) => {
    const { role } = req.body

    if (!["user", "admin"].includes(role)) {
        return next(new ErrorHandler("Role must be either 'user' or 'admin'", 400))
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, {
        returnDocument: "after",
        runValidators: true,
    })

    if (!user) {
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        user,
    })
})

// Delete user -- Admin
exports.deleteUser = asyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`, 404))
    }

    if (user.id === req.user.id) {
        return next(new ErrorHandler("You cannot delete your own account here", 400))
    }

    await removeFromHousehold(user)
    await user.deleteOne()

    res.status(200).json({
        success: true,
        message: "User deleted",
    })
})
