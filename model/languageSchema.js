const mongoose = require('mongoose')
const Schema = mongoose.Schema

const languageSchema = new Schema({
    language:String
})

module.exports = language = mongoose.model('language',languageSchema)