const express = require('express')
const router = express.Router()
const userModel=require('../model/userSchema')
const userHelper = require('./helpers/userHelper')
const productModel = require('../model/productSchema')
const category = require('../model/categorySchema')
const language = require('../model/languageSchema')
const cartModel = require('../model/cartSchema')
const orderModel = require('../model/orderSchema')
const { ObjectId } = require('mongodb')
const { getWishlist } = require('./helpers/userHelper')
const { response } = require('express')
const productHelper = require('./helpers/productHelper')
const categoryModel = require('../model/categorySchema')
const languageModel= require('../model/languageSchema')
const profilePicModel=require('../model/profilePicModel')



module.exports = {

    signUP: (req, res) => {
        userHelper.doSignup(req.body).then((response) => {
            if (response.pass) {
                if (response.status) {
                    res.render('user/otp', { otperr: false })
                } else {
                    let err = true
                    res.render('user/signup', { err, pass: false })
                }
            } else {
                let pass = true
                res.render('user/signup', { pass, err: false })
            }
        })
    },
    signinView: (req, res) => {
        if (req.session.loggedIn) {
            res.redirect('/')
        } else {
            res.render('user/signin', { err: false, blocked: false ,forgot:false})
        }
    },
    signupView: (req, res) => {
        res.render('user/signup', { err: false, pass: false })
    },
    signIN: (req, res) => {
        userHelper.doLogin(req.body).then((response) => {
            if (response.logged) {
                console.log('signedin');
                req.session.userId = response.userId
                console.log(req.session.userId);
                req.session.loggedIn = true
                req.session.logError = false

                //   logged=req.session.loggedIn
                //   res.render('user/user',{logged})
                res.redirect('/')
            } else if (response.blocked) {
                res.render('user/signin', { blocked: true, err: false,forgot:true })
            }
            else {
                req.session.loggedIn = false
                req.session.logError = true
                res.render('user/signin', { err: true, blocked: false,forgot:true })
            }
        })
    },
    verifyOtp: (req, res) => {
        console.log(req.body.otp);
        userHelper.verifyOtp(req.body).then((response) => {
            if (response.status) {
                res.redirect('/signin')
            } else {
                res.render('user/otp', { otperr: true })
            }
        })
    },
    resendOtp: (req, res) => {
        userHelper.resendOtp(req.body)
        res.render('user/otp', { otperr: false })
    },
    logOut: (req, res) => {
        req.session.destroy()
        res.redirect('/')
    },
    homeView: async (req, res) => {
        let logged = req.session.loggedIn
        let products = await productModel.find()
        let latestProducts = await productModel.find().sort({date:-1}).limit(4)
        let cartCount = null
        if (req.session.loggedIn) {
            cartCount = await userHelper.getCartCount(req.session.userId)
        }
        productHelper.getProductCount().then((Counts)=>{
            res.render('user/user', { logged, products, cartCount ,latestProducts,Counts})
        })
        

        
    },
    productsView: async (req, res) => {
        let pageNo = req.params.page
        let user = req.session.userId
        let products = await productModel.find({ listed: true }).skip((pageNo - 1) * 9).limit(9)
        let productCount = await productModel.countDocuments({ listed: true })
        let pageNumber = Math.ceil(productCount / 9)
        let cartItems =await cartModel.findOne({user:ObjectId(user)})
        if(!cartItems){
            cartItems=null
        }
        let category=await categoryModel.find()
        let language=await languageModel.find()
        res.render('user/products', { products, pageNumber, pageNo, user, cartItems,category,language })
        
        
    },
    productPage: async (req, res) => {
        let id = req.params.id
        let product = await productModel.findOne({ _id: id })
        let user = req.session.userId
        res.render('user/product-page', { product , user })
    },
    redirectProduct: (req, res) => {
        res.redirect('/viewproducts/1')
    },
    addToCart: (req, res) => {

        let proId = req.params.id
        let userId = req.session.userId
        userHelper.addToCart(userId, proId).then(() => {
            res.json({ status: true })
        })
    },
    cartView: (req, res) => {
        let userId = req.session.userId

        userHelper.cartTotal(userId).then((sum) => {

            userHelper.getCartItem(userId).then((cartItems) => {
                let totalPrice = sum
                let gstPrice = (sum * 8) / 100
                let grandTotal = totalPrice + ((sum * 8) / 100)

                res.render('user/cart', { cartItems, totalPrice, gstPrice, grandTotal, userId })
            })

        })
    },
    deleteCartItem: (req, res) => {
        let proId = req.params.id
        let userId = req.session.userId
        userHelper.deleteCartItem(proId, userId).then(() => {
            res.json({ status: true })
        })
    },
    checkout: (req, res) => {

        let userId = req.session.userId
        userHelper.cartTotal(userId).then((sum) => {

            userHelper.getCartItem(userId).then((cartItems) => {
                let totalPrice = sum
                let gstPrice = (sum * 8) / 100
                let grandTotal = totalPrice + gstPrice
                res.render('user/checkout', { cartItems, totalPrice, gstPrice, grandTotal, userId })
            })

        })
    },
    placeOrder: (req, res) => {

        userHelper.placeOrder(req.body).then((response) => {
            // console.log(response.orderId );
            console.log(response.duplicatePro);
            userHelper.generateRazorpay(response).then((response) => {
                res.json(response)
            })

        })
        console.log(req.body);
    },
    verifyPayment: (req, res) => {
        console.log(req.body);
        let details = req.body
        userHelper.verifyPayment(req.body).then((response) => {
            let orderId = details['order[orderDetails][receipt]']
            let userId = req.session.userId
            console.log(orderId);
            userHelper.orderCompletion(orderId, userId).then(() => {
                res.json({ status: true })
            })

        }).catch((err) => {
            log(err)
            res.json({ status: false })
        })
    },
    viewOrders: async (req, res) => {
        let userId = req.session.userId
        let orders = await orderModel.find({ user: ObjectId(userId) }).populate('user', 'email').populate('products', 'courseName')
        res.render('user/orders', { orders })

    },
    addToWishlist:(req,res)=>{
        let proId=req.params.id
        let userId=req.session.userId
        userHelper.addToWishlist(proId,userId).then(()=>{
            res.json({status:true})
        })
    },
    viewWishlist:(req,res)=>{
         let userId=req.session.userId
         userHelper.getWishlist(userId).then((response)=>{
           let items=response
            res.render('user/wishlist',{items})
         })

    },
    removeWishItem:(req,res)=>{
        let proId=req.params.id
        let userId=req.session.userId
        userHelper.removeWishItem(proId,userId).then(()=>{
            res.json({status:true})
        })
    },
    moveToWish:(req,res)=>{
       let proId=req.params.id
       let userId=req.session.userId
       userHelper.moveToWishfromCart(proId,userId).then(()=>{
        res.json({status:true})
       })

    },
    moveToCart:(req,res)=>{
        let proId=req.params.id
        let userId=req.session.userId
        userHelper.movetoCartfromWish(proId,userId).then(()=>{
            res.json({status:true})
        })

    },
    sortProducts:(req,res)=>{
        let sortCriteria=req.params.sortData
        productHelper.sortProducts(sortCriteria).then(async(products)=>{
            let user = req.session.userId
            let cartItems =await cartModel.findOne({user:ObjectId(user)})
            if(!cartItems){
                cartItems=null
            }
            let category=await categoryModel.find()
            let language=await languageModel.find()
            res.render('user/sorted-products',{products,cartItems,user,category,language})   
            
        })
    },
    filterProductswithCategory:async(req,res)=>{
        let categoryId=req.params.id
        let user = req.session.userId
        let cartItems =await cartModel.findOne({user:ObjectId(user)})
        if(!cartItems){
            cartItems=null
        }
        let category=await categoryModel.find()
        let language=await languageModel.find()
        let products = await productModel.find({category:ObjectId(categoryId)})
        res.render('user/sorted-products',{products,cartItems,user,category,language})   
        
    },
    filterProductswithLanguage:async(req,res)=>{
        let languageId=req.params.id
        let user = req.session.userId
        let cartItems =await cartModel.findOne({user:ObjectId(user)})
        if(!cartItems){
            cartItems=null
        }
        let category=await categoryModel.find()
        let language=await languageModel.find()
        let products = await productModel.find({language:ObjectId(languageId)})
        res.render('user/sorted-products',{products,cartItems,user,category,language})  
    },
    userCourses:(req,res)=>{
        userId=req.session.userId
        userHelper.getUserCourses(userId).then((user)=>{
            console.log(user.courses);
            res.render('user/user-dashboard',{user})
        })
        
    },
    userProfile:async(req,res)=>{
        let userId=req.session.userId
        let profilePic
        let userDetails =await userModel.findOne({_id:userId})
        let courseNo=userDetails.courses.length
        let userName=userDetails.userName.toUpperCase()
        let profile=await profilePicModel.findOne({user:ObjectId(userId)})
        if(!profile){
            profilePic=null
        }else{
            profilePic=profile.imageUrl
        }
        res.render('user/profile-page',{userDetails,courseNo,userName,profilePic})
  },
  editProfilePage:async(req,res)=>{
    let userId = req.session.userId
    let userDetails = await userModel.findOne({_id:userId})
    res.render('user/edit-profile',{userDetails,err:false,success:false})
  },
  editProfile:(req,res)=>{
    let data = req.body
    let userId=req.session.userId
    userHelper.editUser(data,userId).then(()=>{
        res.redirect('/editProfile')
    })
  },
  resetPass:(req,res)=>{
   let userId= req.session.userId
   let data=req.body
   userHelper.resetPass(userId,data).then(async(response)=>{
    let userDetails = await userModel.findOne({_id:userId})
        if(response.status){
            res.render('user/edit-profile',{err:false,success:true,userDetails})
        }else{
            res.render('user/edit-profile',{err:true,success:false,userDetails})
        }
   })
  },
  searchItems:async(req,res)=>{
    let searchWord=req.body.search
    let products=await productModel.find({courseName:{$regex:searchWord,'$options':'i'},listed:true})
    let user = req.session.userId
            
            let cartItems =await cartModel.findOne({user:ObjectId(user)})
            if(!cartItems){
                cartItems=null
            }
            let category=await categoryModel.find()
            let language=await languageModel.find()    
            res.render('user/sorted-products',{products,cartItems,user,category,language})
  },
  playCourse:(req,res)=>{
    let proId=req.params.id
    let videoNo=req.params.video
    let userId=req.session.userId
    productHelper.getVideo(proId,userId).then(async(videoUrl)=>{
     console.log(videoUrl)
     let video=videoUrl[videoNo]
      let course=await productModel.findOne({_id:proId})
      res.render('user/videoPlayer',{video,course,videoUrl,videoNo})
    }).catch((err)=>{
        console.log(err);
    })
  },
  test:async(req,res)=>{
    let pageNo=req.params.no
    let products = await productModel.find({ listed: true }).skip((pageNo) * 5).limit(5)
    console.log(products);
    res.json(products)
  },
  test1:async(req,res)=>{
    let products=await productModel.find()
    res.render('user/test',{products})
  },
  profilePic:(req,res)=>{
    let image=req.files.image[0].filename
    let userId=req.session.userId
    userHelper.profilePicChange(image,userId).then(()=>{
        res.redirect('/profile')
    })
  },
  forgotPass:(req,res)=>{
    res.render('user/forgot-password',{err:false})
  },
  resetPassOtp:(req,res)=>{
    let email=req.body.email
    userHelper.changePass(email).then((response)=>{
        if(response.status){
            res.render('user/resetPassOtp',{email,err:false})
        }else if(response.userErr){
            res.render('user/forgot-password',{err:true})
        }
    })
  },
  resetVerifyOtp:(req,res)=>{
    let userOtp=req.body.otp
    let email=req.body.email
    console.log(userOtp);
    userHelper.resetPassOtp(userOtp).then((response)=>{
        if(response.status){
            res.render('user/resetPass',{email,err:true})
        }else{
            res.render('user/resetPassOtp',{email,err:true})
        }

    })

  },
  changePass:(req,res)=>{
    let data=req.body
    userHelper.doChangePass(data).then((response)=>{
        if(response.status){
            res.render('user/signin',{blocked: false, err: false,forgot:true})
        }else{
            res.send('error')
        }

    })
  }
 
   


}