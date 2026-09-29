const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.ObjectId,
        ref:"User",
        required: true,
        unique: true
    },
    items:[
        {
            product:{
                type: mongoose.Schema.ObjectId,
                ref:"Product",
                required: true
            },
            quantity:{
                type:Number,
                required:true,
                min:[1, "Quantity must be at least 1"],
                default:1
            }
        }
    ],
    updatedAt:{
        type:Date,
        default:Date.now
    }
})

cartSchema.pre("save", function() {
    this.updatedAt = Date.now()
})

module.exports = mongoose.model("Cart", cartSchema)
