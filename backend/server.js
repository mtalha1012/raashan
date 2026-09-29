const dotenv = require("dotenv")

// Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log("Server shutting down, uncaught exception")
    process.exit(1)
})

// Load secrets before anything reads process.env
dotenv.config({ path: "backend/config/config.env", quiet: true })

const requiredEnv = ["PORT", "DB_URI", "JWT_SECRET", "JWT_EXPIRE", "COOKIE_EXPIRE"]
const missingEnv = requiredEnv.filter((key) => !process.env[key])
if (missingEnv.length) {
    console.log(`Missing environment variables: ${missingEnv.join(", ")}`)
    console.log("Copy backend/config/config.env.example to backend/config/config.env and fill it in")
    process.exit(1)
}

const app = require("./app")
const connectDatabase = require("./config/database")

connectDatabase()

const server = app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`)
})

// Unhandled promise rejection
process.on("unhandledRejection", (err)=>{
    console.log(`Error: ${err.message}`);
    console.log("Server shutting down, unhandled promise rejection")

    server.close(() => {
        process.exit(1);
    })
})
