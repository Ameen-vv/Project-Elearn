const productModel = require('../model/productSchema')
const category = require('../model/categorySchema')
const language = require('../model/languageSchema')

module.exports = {
    productValidation: async (req, res, next) => {
        let productName = req.body.name
        let result = productName.toUpperCase()
        let product = await productModel.findOne({ courseName: result })
        if (product) {
            let productErr=true
            let categories = await category.find()
            let languages = await language.find()
            res.render('admin/add-products',{categories,languages,productErr})

        } else {
            next()
        }
    },
    categoryValidation:async(req,res,next)=>{
        let categoryName=req.body.name
        let categoryCheck = await category.findOne({name:categoryName})
        if(categoryCheck){
            let categoryErr = true
            let categories = await category.find()
            res.render('admin/viewCategory',{categories,categoryErr})
        }else{
            next()
        }

    },
    languageValidation:async(req,res,next)=>{
        let languageName=req.body.name
        let languageCheck= await language.findOne({language:languageName})
        if(languageCheck){
            let languages = await language.find()
            let languageErr=true
            res.render('admin/viewLanguage',{languages,languageErr})
        }else{
            next()
        }
    }
}