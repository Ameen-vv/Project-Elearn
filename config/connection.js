const mongoose = require('mongoose')
const User = require('../model/userSchema')


module.exports.connect=function(){
    mongoose.connect('mongodb://localhost:27017/Elearn',()=>console.log('connected to database'))
}