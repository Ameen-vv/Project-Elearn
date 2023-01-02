const { response } = require('express')
const express = require('express')
const router = express.Router()
const userHelper = require('../controllers/helpers/userHelper')
const userController = require('../controllers/userController')
const { verifyOtp } = require('../controllers/helpers/userHelper')
const userSession=require("../middlewares/sessionControl")
const userBlock=require('../middlewares/userBlock')
const sessionControl = require('../middlewares/sessionControl')
const cloudinary=require('cloudinary').v2
const fs=require('fs')

//---------GET-and-POST----------------------------------------

router.route('/signin')
      .get(userController.signinView)
      .post(userController.signIN)

router.route('/signup')
      .get(userController.signupView)
      .post(userController.signUP)

router.route('/editProfile')
      .get(userSession.userSession,userBlock.userBlocked,userController.editProfilePage)
      .post(userSession.userSession,userBlock.userBlocked,userController.editProfile)    
      
router.route('/forgot-pass')
      .get(userController.forgotPass)
      .post(userController.resetPassOtp)


//-----------------GET----------------------------------------------------------------------
router.get('/',userBlock.userBlocked,userController.homeView)
router.get('/viewproducts/:page',userSession.userSession,userBlock.userBlocked,userController.productsView)
router.get('/viewproducts/',userController.redirectProduct)
router.get('/cart',sessionControl.userSession,userBlock.userBlocked,userController.cartView)
router.get('/productPage/:id',sessionControl.userSession,userBlock.userBlocked,userController.productPage)
router.get('/add-to-cart/:id',sessionControl.userSession,userBlock.userBlocked,userController.addToCart)
router.get('/delete-cart-item/:id',sessionControl.userSession,userBlock.userBlocked,userController.deleteCartItem)
router.get('/checkout',userSession.userSession,userBlock.userBlocked,userController.checkout)
router.get('/payment-success',userSession.userSession,(req,res)=>{res.render('user/paymentConfirm')})
router.get('/orders',userSession.userSession,userBlock.userBlocked,userController.viewOrders)
router.get('/add-to-wishlist/:id',userSession.userSession,userController.addToWishlist)
router.get('/wishlist',userSession.userSession,userBlock.userBlocked,userController.viewWishlist)
router.get('/delete-wish-item/:id',userController.removeWishItem)
router.get('/move-to-wish/:id',userController.moveToWish)
router.get('/move-to-cart/:id',userController.moveToCart)
router.get('/viewproducts/sort/:sortData',userSession.userSession,userBlock.userBlocked,userController.sortProducts)
router.get('/viewproducts/filterCategory/:id',userSession.userSession,userBlock.userBlocked,userController.filterProductswithCategory)
router.get('/viewproducts/filterLanguage/:id',userSession.userSession,userBlock.userBlocked,userController.filterProductswithLanguage)
router.get('/profile',userSession.userSession,userBlock.userBlocked,userController.userProfile)
router.get('/mycourses',userSession.userSession,userBlock.userBlocked,userController.userCourses)
router.get('/playVideo/:id/:video',userController.playCourse)
router.get('/logout',userController.logOut)





//-----------------------POST----------------------------------------

router.post('/verifyotp',userController.verifyOtp)
router.post('/resendotp',userController.resendOtp)
router.post('/placeorder',userSession.userSession,userController.placeOrder)
router.post('/verify-payment',userSession.userSession,userController.verifyPayment)
router.post('/editUserPass',userController.resetPass)
router.post('/search',userController.searchItems)
router.post('/profile-pic',userController.profilePic)
router.post('/forgotPassOtp',userController.resetVerifyOtp)
router.post('/changePass',userController.changePass)




module.exports=router