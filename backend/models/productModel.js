const mongoose = require("mongoose")
const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please enter product name"],
        trim:true
    },
    description:{
        type:String,
        required:[true, "Please enter description"]
    },
    price:{
        type:Number,
        required:[true, "Please enter product Price"],
        min:[0, "Price cannot be negative"],
        max:[99999999, "Price cannot exceed 8 digits"]
    },
    rating: {
        type:Number,
        default:0
    },
    images:[{
        publicId:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    }],
    category:{
        type:String,
        required:[true, "Please enter category"],
    },
    stock:{
        type:Number,
        required:[true, "Please enter product stock"],
        min:[0, "Stock cannot be negative"],
        max:[9999, "Stock cannot exceed 4 digits"],
        default:1
    },
    numberOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
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