var db = require('mongoose')
var user = require('../../model/userSchema')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const product = require('../../model/productSchema')
const cartModel = require('../../model/cartSchema')
const { ObjectId } = require('mongodb')
const orderModel = require('../../model/orderSchema')
const { response } = require('express')
const Razorpay = require('razorpay')
const wishlistModel = require('../../model/whishlistSchema')
const { resolve } = require('path')
const profilePicModel=require('../../model/profilePicModel')

var instance = new Razorpay({ key_id:process.env.RAZORPAYKEY, key_secret: process.env.RAZORPAY_KEY_SECRET })
//----------------------------------------OTP-----------------------------------------
var Name
var Email
var Phone
var Password
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: 'Gmail',

    auth: {
        user: '124elearn@gmail.com',
        pass: process.env.NODEMAILER_PASS,
    }

});

var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
// console.log(otp);
//----------------------------------------------------------------------------------------



module.exports = {
    //----------sign up-----------------------------------------------------------------------
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}

            if (userData.password == userData.repassword) {
                userData.password = await bcrypt.hash(userData.password, 10)
                Name = userData.name
                Email = userData.email
                Phone = userData.phone
                Password = userData.password
                response.pass = true
                user.findOne({ email: userData.email }, (err, data) => {
                    if (!data) {

                        var mailOptions = {
                            to: userData.email,
                            subject: "Otp for registration is: ",
                            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
                        }
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log(error);
                            }
                            console.log("msg sent");
                        })
                        response.status = true;
                        resolve(response)

                    } else {
                        response.status = false
                        resolve(response)
                    }
                })
            } else {
                resolve({ pass: false })
            }

        })
    },
    verifyOtp: (userData) => {
        console.log('verifyotp');
        return new Promise((resolve, reject) => {
            let response = {}
            if (userData.otp == otp) {
                let newUser = new user({
                    userName: Name,
                    email: Email,
                    phone: Phone,
                    password: Password,
                    block: false
                })
                newUser.save().then(()=>{
                    response.status = true
                    let newCart = new cartModel({
                        user:newUser._id
                    })
                    newCart.save().then(()=>{
                        resolve(response)
                    })
                })     
                
            } else {
                response.status = false
                resolve(response)
            }
        })
    },
    resendOtp: () => {
        mailOptions = {
            to: Email,
            subject: "Otp for registration is: ",
            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            }
            console.log("msg sent");
        })
    },
    //----------login------------------------------------------------------------------------        
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            if (userData.email || userData.password) {
                let userLogged = await user.findOne({ email: userData.email })
                if (userLogged) {
                    // console.log(userLogged.block);
                    if (userLogged.block) {
                        response.blocked = true
                        resolve(response)
                    } else {
                        if (userLogged) {
                            await bcrypt.compare(userData.password, userLogged.password).then(async(status) => {
                                if (status) {
                                    response.logged = true
                                    response.user = userLogged
                                    response.userId = userLogged._id
                                    resolve(response)
                                } else {
                                    response.logged = false
                                    response.passerr = true
                                    resolve(response)
                                }
                            })
                        } else {
                            response.logged = false
                            response.emailerr = true
                            resolve(response)
                        }
                    }

                } else {
                    response.logged = false
                    response.passerr = true
                    resolve(response)
                }
            }
        })
    },
    viewUser: () => {
        return new Promise(async (resolve, reject) => {
            let userList = await user.find()
            resolve(userList)

        })
    },
    blockUser: async (userId) => {
        await user.updateOne({ _id: userId }, { $set: { block: true } })
    },
    unblockUser: async (userId) => {
        await user.updateOne({ _id: userId }, { $set: { block: false } })
    },
    addToCart: (userId, proId) => {
        return new Promise(async (resolve, reject) => {
            let userCart = await cartModel.findOne({ user: ObjectId(userId) })
            if (userCart) {
                let cart = await cartModel.findOne({ user: ObjectId(userId), products: ObjectId(proId) })
                if (cart) {
                    resolve()
                } else {
                    await cartModel.findOneAndUpdate({ user: ObjectId(userId) }, { $push: { products: proId } })
                    resolve()
                    
                }

            } else {
                const newCart = new cartModel({
                    user: userId,
                    products: [proId]
                })
                newCart.save()
                resolve()
            }
        })
    },
    getCartItem: (userId) => {
        return new Promise(async (resolve, reject) => {
            let carItems = await cartModel.findOne({ user: ObjectId(userId) }).populate('products')
            if (carItems) {
                resolve(carItems)
            } else {
                const newCart = await new cartModel({
                    user: userId,
                    products: []
                })
                newCart.save()
                resolve(newCart)
            }
        })


    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await cartModel.findOne({ user: ObjectId(userId) })
            if (cart) {
                let cartCount = cart.products.length
                resolve(cartCount)
            } else {
                let cartCount = null
                resolve(cartCount)
            }
        }
        )
    },
    deleteCartItem: (proId, userId) => {
        return new Promise(async (resolve, reject) => {
            await cartModel.findOneAndUpdate({ user: ObjectId(userId) }, { $pull: { products: proId } })
            resolve()
        })
    },
    cartTotal: (userId) => {
        return new Promise(async (resolve, reject) => {
            let carItems = await cartModel.findOne({ user: ObjectId(userId) }).populate('products')
            let sum = 0
            if (carItems) {
                let totalProducts = carItems.products.length
                for (let i = 0; i < totalProducts; i++) {
                    sum = sum + carItems.products[i].price
                }
            } else {
                sum = 0
            }

            resolve(sum)



        })
    },
    placeOrder: (order) => {
        return new Promise(async (resolve, reject) => {
            console.log('start');
            let checkout = {}
            let cartData = await cartModel.findOne({ user: ObjectId(order.userId) })
            let productList = cartData.products.slice()
            let carItems = await cartModel.findOne({ user: ObjectId(order.userId) }).populate('products')
            let totalProducts = carItems.products.length
            let sum = 0
            for (let i = 0; i < totalProducts; i++) {
                sum = sum + carItems.products[i].price
            }
            totalPrice = sum + ((sum * 8) / 100)
            let date = Date.now()
            // if(order.payment='cod'){
            //     let newOrder = new orderModel({
            //         user:order.userId,
            //         products:productList,
            //         total:sum,
            //         paymentMode:'cash on delivery',
            //         location:{
            //             state:order.state,
            //             country:order.country
            //         },
            //         paymentStatus:'success'

            //     })
            //     newOrder.save()
            //     await cartModel.findOneAndUpdate({user:ObjectId(order.userId)},{$set:{products:[]}})
            //     checkout.status=true
            //     resolve(checkout)
            // }
            if (order.payment = 'online') {
                let newOrder = new orderModel({
                    user: order.userId,
                    products: productList,
                    total: totalPrice,
                    paymentMode: 'Online',
                    location: {
                        state: order.state,
                        country: order.country
                    },
                    paymentStatus: 'pending',
                    date: date

                })
                checkout.orderId = newOrder._id
                newOrder.save()
                checkout.userId = order.userId
                checkout.products = productList
                checkout.totalPrice = parseInt(totalPrice)
                let duplicateProId
                for (let i = 0; i < totalProducts; i++) {
                    var productCheck = await user.findOne({ _id: order.userId, courses: ObjectId(productList[i]) })
                    if(productCheck){
                      duplicateProId=productList[i]
                    }
                }
                if (productCheck) {
                    let duplicatePro= await product.findOne({_id:duplicateProId})
                    checkout.duplicatePro=duplicatePro.courseName
                    checkout.productExist = true
                    resolve(checkout)
                } else {
                    checkout.status = true
                    resolve(checkout)
                }

            }
            else {
                checkout.status = false
                resolve(checkout)
            }

        })

    },
    orderCompletion: (orderId, userId) => {
        return new Promise(async (resolve, reject) => {
            await orderModel.findOneAndUpdate({ _id: orderId }, { $set: { paymentStatus: "success" } }).then(() => {
                console.log('updated');
            })
            await cartModel.findOneAndUpdate({ user: ObjectId(userId) }, { $set: { products: [] } })
            let order = await orderModel.findOne({ _id: orderId })
            console.log(order.paymentStatus);
            let productList = order.products.slice()
            let totalProducts = productList.length
            await user.findOneAndUpdate({ _id: userId }, { $push: { courses: productList } })
            for (let i = 0; i < totalProducts; i++) {
                await product.findOneAndUpdate({ _id: productList[i] }, { $push: { users: userId } })
            }
            resolve()
        })
    },
    generateRazorpay: (order) => {
        return new Promise((resolve, reject) => {
            let response = {}
            response.duplicateProName=order.duplicatePro
            let options = {
                amount: order.totalPrice*100,
                currency: "INR",
                receipt: "" + order.orderId
            }
            if (order.status) {
                response.status = true
            }
            else if (order.productExist) {
                response.productExist = true
            } else {
                response.status = false
            }
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(order);
                    response.orderDetails = order
                    resolve(response)
                }
            })
        })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            let response = {}
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', 'Bif0itWiYVxnUaWzSOnNrm2u')
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                response.payment = true
                resolve(response)
            } else {
                response.payment = false
                reject()
            }
        })
    },
    addToWishlist: (proId, userId) => {
        return new Promise(async (resolve, reject) => {
            let wishlist = await wishlistModel.findOne({ user: ObjectId(userId) })
            if (wishlist) {

                let proCheck = await wishlistModel.findOne({ user: ObjectId(userId), products: ObjectId(proId) })
                if (proCheck) {

                    resolve()
                } else {
                    await wishlistModel.findOneAndUpdate({ user: ObjectId(userId) }, { $push: { products: proId } })
                    resolve()
                }

            } else {
                let newWishlist = new wishlistModel({
                    user: userId,
                    products: [proId]
                })
                newWishlist.save()
                resolve()
            }
        })

    },
    getWishlist: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wishlist = await wishlistModel.findOne({ user: ObjectId(userId) }).populate('products')
            if (wishlist) {
                resolve(wishlist)
            } else {
                let newWishlist = await new wishlistModel({
                    user: userId
                })
                newWishlist.save()
                resolve(newWishlist)

            }
        })
    },
    removeWishItem:(proId,userId)=>{
        return new Promise(async (resolve, reject) => {
            await wishlistModel.findOneAndUpdate({ user: ObjectId(userId) }, { $pull: { products: proId } })
            resolve()
        })
    },
    moveToWishfromCart:(proId,userId)=>{
        return new Promise(async(resolve,reject)=>{
         let proCheck=await wishlistModel.findOne({user:ObjectId(userId),products:proId})
         if(proCheck){
            await cartModel.findOneAndUpdate({user:ObjectId(userId)},{$pull:{products:proId}})
            resolve()
         }else{
            await wishlistModel.findOneAndUpdate({user:ObjectId(userId)},{$push:{products:proId}}).then(async()=>{
                await cartModel.findOneAndUpdate({user:ObjectId(userId)},{$pull:{products:proId}})
                resolve()

            })
         }   
        
        })
    },
    movetoCartfromWish:(proId,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let proCheck=await cartModel.findOne({user:ObjectId(userId),products:proId})
            if(proCheck){
                await wishlistModel.findOneAndUpdate({user:ObjectId(userId)},{$pull:{products:proId}})
                resolve()
            }else{
                await cartModel.findOneAndUpdate({user:ObjectId(userId)},{$push:{products:proId}}).then(async()=>{
                    await wishlistModel.findOneAndUpdate({user:ObjectId(userId)},{$pull:{products:proId}})  
                    resolve()
                })

            }
              
        })
    },
    getUserCourses:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           let userCourses =await user.findOne({_id:userId}).populate('courses')
            resolve(userCourses)
        })
    },
    editUser:(data,userId)=>{
        return new Promise(async(resolve,reject)=>{

            if(data.name){
                await user.findOneAndUpdate({id:userId},{$set:{userName:data.name}})
            }if(data.phone){
                await user.findOneAndUpdate({id:userId},{$set:{phone:data.phone}})
            }
            resolve()
        })
    },
    resetPass:(id,data)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let userLogged =await user.findOne({_id:id})
            await bcrypt.compare(data.oldPass,userLogged.password).then(async(status) =>{
                if(status){                
                        let newPassword= await bcrypt.hash(data.newPass, 10)
                        await user.findOneAndUpdate({_id:id},{$set:{password:newPassword}}).then(()=>{
                            response.status=true
                            resolve(response)
                        }) 
                }else{
                    response.status=false
                    resolve(response)
                }
            
            })

        })
    },
    profilePicChange:(image,user)=>{
        return new Promise(async(resolve,reject)=>{
            let userProfile=await profilePicModel.findOne({user:ObjectId(user)})
            if(userProfile){
                await profilePicModel.findOneAndUpdate({user:ObjectId(user)},{$set:{imageUrl:image}})
                resolve()
            }else{
                let newProfile=new profilePicModel({
                    user:user,
                    imageUrl:image
                })
                newProfile.save().then(()=>{
                    resolve()
                })
            }
        })
    },
    changePass:(userEmail)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let userCheck=await user.findOne({email:userEmail})

            if(userCheck){
                mailOptions = {
                    to: userEmail,
                    subject: "Otp for registration is: ",
                    html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
                }
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                    }
                    console.log("msg sent");
                })
                response.status=true
                response.user=userEmail
                resolve(response)
            }else{
                response.userErr=true
                resolve(response)
            }
        })
    },
    resetPassOtp:(userOtp)=>{
        let response={}
        return new Promise((resolve,reject)=>{
            if(userOtp==otp){
                response.status=true
                resolve(response)
            }else{
                response.status=false
                resolve(response)
            }
            console.log(response )
        })

    },
    doChangePass:(data)=>{
        return new Promise(async(resolve,reject)=>{
           let response={}
            let newPass=await bcrypt.hash(data.password, 10)
            let userDetails=await user.findOne({email:data.email})
            if(userDetails){
                await user.findOneAndUpdate({email:data.email},{$set:{password:newPass}}).then(()=>{
                    response.status=true
                    resolve(response)

                })
                
            }else{
                response.status=false
                resolve(response)
            }
        })
    }


}