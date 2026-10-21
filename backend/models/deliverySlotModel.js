const mongoose = require("mongoose")

const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/

// Daily delivery window
const deliverySlotSchema = new mongoose.Schema({
    label:{
        type:String,
        required:[true, "Please enter slot label"],
        trim:true
    },
    startTime:{
        type:String,
        required:[true, "Please enter start time"],
        match:[TIME_FORMAT, "Start time must be HH:MM"]
    },
    endTime:{
        type:String,
        required:[true, "Please enter end time"],
        match:[TIME_FORMAT, "End time must be HH:MM"]
    },
    capacity:{
        type:Number,
        required:[true, "Please enter capacity"],
        min:[1, "Capacity must be at least 1"],
        max:[500, "Capacity cannot exceed 500"]
    },
    isActive:{
        type:Boolean,
        default:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

deliverySlotSchema.pre("validate", function() {
    if (this.startTime && this.endTime && this.startTime >= this.endTime) {
        this.invalidate("endTime", "End time must be after start time")
    }
})

module.exports = mongoose.model("DeliverySlot", deliverySlotSchema)
