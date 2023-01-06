const mongoose = require('mongoose')
const User = require('../model/userSchema')


module.exports.connect=function(){
    mongoose.connect(process.env.DB_LINK,()=>console.log('connected to database'))
}