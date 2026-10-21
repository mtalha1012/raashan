const mongoose = require("mongoose")

const householdSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please enter household name"],
        trim:true,
        maxLength:[40, "Household name cannot exceed 40 characters"]
    },
    // Code used to join
    inviteCode:{
        type:String,
        required:true,
        unique:true,
        uppercase:true
    },
    owner:{
        type: mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    members:[
        {
            user:{
                type: mongoose.Schema.ObjectId,
                ref:"User",
                required:true
            },
            // Name shown on list items
            nickname:{
                type:String,
                trim:true,
                maxLength:[20, "Nickname cannot exceed 20 characters"]
            },
            joinedAt:{
                type:Date,
                default:Date.now
            }
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Household", householdSchema)
