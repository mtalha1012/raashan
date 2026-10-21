const mongoose = require("mongoose")
const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please enter product name"],
        trim:true
    },
    description:{
        type:String,
        default:""
    },
    price:{
        type:Number,
        required:[true, "Please enter product Price"],
        min:[0, "Price cannot be negative"],
        max:[99999999, "Price cannot exceed 8 digits"]
    },
    // Pack size like 1 litre or 12 pcs (used by list parser)
    unit:{
        type:String,
        required:[true, "Please enter product unit"],
        trim:true
    },
    // Other names for product
    aliases:[{
        type:String,
        lowercase:true,
        trim:true
    }],
    image:{
        type:String,
        trim:true,
        default:""
    },
    category:{
        type: mongoose.Schema.ObjectId,
        ref:"Category",
        required:[true, "Please enter category"],
    },
    stock:{
        type:Number,
        required:[true, "Please enter product stock"],
        min:[0, "Stock cannot be negative"],
        max:[9999, "Stock cannot exceed 4 digits"],
        default:1
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref:"User",
        required: true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports =  mongoose.model("Product", productSchema)
