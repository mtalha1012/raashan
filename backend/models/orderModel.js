const mongoose = require("mongoose")

const ORDER_STATUSES = ["Placed", "Packed", "Out for Delivery", "Delivered", "Cancelled"]

const orderSchema = new mongoose.Schema({
    // Copied from the user's saved address so later edits don't change past orders
    shippingInfo:{
        line1:{ type:String, required:[true, "Please enter address"] },
        area:{ type:String, required:[true, "Please enter area"] },
        city:{ type:String, required:[true, "Please enter city"] },
        phone:{ type:String, required:[true, "Please enter phone number"] }
    },
    deliverySlot:{
        slot:{
            type: mongoose.Schema.ObjectId,
            ref:"DeliverySlot",
            required:true
        },
        label:{ type:String, required:true },
        // Calendar day in Pakistan time, "YYYY-MM-DD"
        date:{ type:String, required:true }
    },
    orderItems:[
        {
            name:{ type:String, required:true },
            price:{ type:Number, required:true },
            unit:{ type:String },
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
    // Set when the person ordering is in a household, so the whole family sees the order
    household:{
        type: mongoose.Schema.ObjectId,
        ref:"Household",
        default:null
    },
    paymentMethod:{
        type:String,
        enum:["Cash on Delivery"],
        default:"Cash on Delivery"
    },
    paidAt:{
        type:Date
    },
    itemsPrice:{ type:Number, required:true, default:0 },
    deliveryFee:{ type:Number, required:true, default:0 },
    totalPrice:{ type:Number, required:true, default:0 },
    orderStatus:{
        type:String,
        required:true,
        enum:ORDER_STATUSES,
        default:"Placed"
    },
    deliveredAt:Date,
    createdAt:{
        type:Date,
        default:Date.now
    }
})

orderSchema.index({ "deliverySlot.slot": 1, "deliverySlot.date": 1 })

module.exports = mongoose.model("Order", orderSchema)
module.exports.ORDER_STATUSES = ORDER_STATUSES
