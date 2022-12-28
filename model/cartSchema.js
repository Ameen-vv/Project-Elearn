const mongoose = require('mongoose')
const { schema } = require('./categorySchema')
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

const cartSchema= new Schema({
    user:{
        type:ObjectId,
        ref:'User'
    },
    products:{
        type:[ObjectId],
        ref:'Products',
        default:[]
    }
})

module.exports=Cart=mongoose.model('cart',cartSchema)