const mongoose = require('mongoose')
const { schema } = require('./userSchema')
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId


const orderSchema= new Schema({
    user:{
        type:ObjectId,
        ref:'User'
    },
    products:{
        type:[ObjectId],
        ref:'Products'
    },
    total:Number,
    paymentStatus:String,
    paymentMode:String,
    date:{
        type:Date
    },
    location:{
        state:String,
        country:String
    }
    // orderConfirmation:{
    //     type:Boolean,
    //     default:false
    // }
})
module.exports=Orders=mongoose.model('Orders',orderSchema)