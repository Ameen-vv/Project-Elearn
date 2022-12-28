const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

const userSchema = new Schema({
    userName: String,
    email: {
        type:String,
        
    },
    password:String,
    phone:Number,
    block:Boolean,
    courses:{
        type:[ObjectId],
        ref:'Products',
        default:[]
    },
    orders:{
        type:[ObjectId],
        ref:'Orders'
    }
})
module.exports=User=mongoose.model('User',userSchema)