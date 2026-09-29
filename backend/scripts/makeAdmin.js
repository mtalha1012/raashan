// Promote an existing user to admin: npm run make-admin -- user@example.com
const dotenv = require("dotenv")
const mongoose = require("mongoose")

dotenv.config({ path: "backend/config/config.env", quiet: true })

const User = require("../models/userModel")

const makeAdmin = async () => {
    const email = process.argv[2]
    if (!email) {
        console.log("Usage: npm run make-admin -- <email>")
        process.exit(1)
    }

    await mongoose.connect(process.env.DB_URI)

    const user = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { role: "admin" },
        { returnDocument: "after" }
    )

    console.log(user ? `${user.email} is now an admin` : `No user found with email ${email}`)

    await mongoose.disconnect()
    process.exit(user ? 0 : 1)
}

makeAdmin().catch((err) => {
    console.log(`Error: ${err.message}`)
    process.exit(1)
})
