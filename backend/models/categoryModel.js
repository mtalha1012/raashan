const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please enter category name"],
        unique:true,
        trim:true,
        maxLength:[40, "Category name cannot exceed 40 characters"]
    },
    // Shown on category chips and as the fallback picture for products without an image
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
