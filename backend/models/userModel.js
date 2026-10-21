const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please enter your name"],
        trim: true,
        maxLength: [30, "Name cannot be more than 30 characters"],
        minLength: [2, "Name should have at least 2 characters"]
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: [true, "Please enter your email"],
        validate: [validator.isEmail, "Please enter correct email"]
    },
    password: {
        minLength: [8, "Password should have at least 8 characters"],
        type:String,
        required: [true, "Please enter your password"],
        select: false
    },
    phone: {
        type: String,
        trim: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    // One household per user
    household: {
        type: mongoose.Schema.ObjectId,
        ref: "Household",
        default: null
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
})

userSchema.pre("save", async function() {
    if (!this.isModified("password")) return
    this.password = await bcrypt.hash(this.password, 10)
})

// JWT Token
userSchema.methods.getJWTToken = function() {
    return jwt.sign({
        id: this.id,
    }, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE,
    })
}

userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

// Password reset
userSchema.methods.getResetPasswordToken = function() {
    // Token generation
    const resetToken = crypto.randomBytes(20).toString("hex")

    this.resetPasswordToken = crypto.createHash("sha256")
    .update(resetToken)
    .digest("hex")

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000
    return resetToken
}

module.exports = mongoose.model("User", userSchema)
