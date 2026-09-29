const mongoose = require("mongoose")

// Connection errors bubble up as an unhandled rejection, which shuts the server down (see server.js)
const connectDatabase = () => {
    mongoose.connect(process.env.DB_URI)
        .then((data) => {
            console.log(`Mongodb connected with server: ${data.connection.host}`)
        })
}

module.exports = connectDatabase
