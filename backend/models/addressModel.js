const mongoose = require("mongoose")

const addressSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    label:{
        type:String,
        enum:{ values:["Home", "Work", "Other"], message:"Label must be Home, Work or Other" },
        default:"Home"
    },
    line1:{ type:String, required:[true, "Please enter house / street"], trim:true },
    area:{ type:String, required:[true, "Please enter area"], trim:true },
    city:{ type:String, required:[true, "Please enter city"], trim:true },
    phone:{
        type:String,
        required:[true, "Please enter phone number"],
        trim:true,
        match:[/^[0-9+\-\s]{10,15}$/, "Please enter a valid phone number"]
    },
    isDefault:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Address", addressSchema)
