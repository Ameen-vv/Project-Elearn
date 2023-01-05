const mongoose = require('mongoose')
const User = require('../model/userSchema')


module.exports.connect=function(){
    mongoose.connect('mongodb+srv://Elearn:elearn123@cluster0.futjdlg.mongodb.net/Cluster0?retryWrites=true&w=majority',()=>console.log('connected to database'))
}