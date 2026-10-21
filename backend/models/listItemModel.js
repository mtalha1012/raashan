const mongoose = require("mongoose")

const listItemSchema = new mongoose.Schema({
    household:{
        type: mongoose.Schema.ObjectId,
        ref:"Household",
        required:true,
        index:true
    },
    // Text as written
    text:{
        type:String,
        required:[true, "Please enter the item"],
        trim:true,
        maxLength:[80, "Item cannot exceed 80 characters"]
    },
    // Null until linked to a product
    product:{
        type: mongoose.Schema.ObjectId,
        ref:"Product",
        default:null
    },
    quantity:{
        type:Number,
        min:[1, "Quantity must be at least 1"],
        max:[99, "Quantity cannot exceed 99"],
        default:1
    },
    addedBy:{
        type: mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    // Sender name or nickname
    requestedBy:{
        type:String,
        trim:true,
        default:""
    },
    done:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("ListItem", listItemSchema)
