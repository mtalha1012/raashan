// Creating token and saving in cookie

const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken()

    // Never send the password hash back (present after register / login)
    user.password = undefined

    // Sending to cookie
    const options = {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        token,
    })
}

module.exports = sendToken