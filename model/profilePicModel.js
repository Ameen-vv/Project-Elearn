const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

const profilePicSchema=({
    user:{
        type:ObjectId,
        ref:'User'
    },
    imageUrl:{
        type:String
    }
})
module.exports=profilePic=mongoose.model('profilePic',profilePicSchema)