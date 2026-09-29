const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    shippingInfo:{
        address:{ type:String, required:[true, "Please enter address"] },
        city:{ type:String, required:[true, "Please enter city"] },
        state:{ type:String, required:[true, "Please enter state"] },
        country:{ type:String, required:[true, "Please enter country"] },
        pinCode:{ type:String, required:[true, "Please enter pin code"] },
        phoneNo:{ type:String, required:[true, "Please enter phone number"] }
    },
    orderItems:[
        {
            name:{ type:String, required:true },
            price:{ type:Number, required:true },
            quantity:{ type:Number, required:true, min:1 },
            image:{ type:String },
            product:{
                type: mongoose.Schema.ObjectId,
                ref:"Product",
                required:true
            }
        }
    ],
    user:{
        type: mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    paymentInfo:{
        id:{ type:String },
        status:{ type:String, default:"pending" }
    },
    paidAt:{
        type:Date
    },
    itemsPrice:{ type:Number, required:true, default:0 },
    taxPrice:{ type:Number, required:true, default:0 },
    shippingPrice:{ type:Number, required:true, default:0 },
    totalPrice:{ type:Number, required:true, default:0 },
    orderStatus:{
        type:String,
        required:true,
        enum:["Processing", "Shipped", "Delivered", "Cancelled"],
        default:"Processing"
    },
    deliveredAt:Date,
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Order", orderSchema)
