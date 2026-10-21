const mongoose = require("mongoose")

// One line on a household's shared grocery list
const listItemSchema = new mongoose.Schema({
    household:{
        type: mongoose.Schema.ObjectId,
        ref:"Household",
        required:true,
        index:true
    },
    // What was written, e.g. "anday 12"
    text:{
        type:String,
        required:[true, "Please enter the item"],
        trim:true,
        maxLength:[80, "Item cannot exceed 80 characters"]
    },
    // The store product it was matched to; null until someone links it
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
    // Who asked for it -- the WhatsApp sender name, or the member's nickname
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
