const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please enter category name"],
        unique:true,
        trim:true,
        maxLength:[40, "Category name cannot exceed 40 characters"]
    },
    // Emoji used when product has no image
    icon:{
        type:String,
        default:"🛒"
    },
    description:{
        type:String,
        trim:true,
        default:""
    },
    sortOrder:{
        type:Number,
        default:0
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Category", categorySchema)
