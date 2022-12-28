const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Objectid = mongoose.Types.ObjectId

const productSchema = new Schema({
    courseName:String,
    category:{
        type:Objectid,
        ref:'category'
    
    
    },
    price:Number,
    language:{
       type:Objectid,
       ref:'language'

    },
    hours:Number,
    description:String,
    videoUrl:String,
    imageUrl:String,
    listed:Boolean,
    toLearn:Array,
    videoUrl:{
        type:[Object],
        default:[]
    },
    users:{
        type:[Objectid],
        ref:'User',
        default:[]
    },
    requirements:{
        type:[String],
        default:[]
    },
    date:{
        type:Date,
        default:Date.now()
    }
    
    
    
})
module.exports=Products=mongoose.model('Products',productSchema)