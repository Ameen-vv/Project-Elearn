const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const sessionControl = require('../middlewares/sessionControl')
const productHelper = require('../controllers/helpers/productHelper')
const { response } = require('express')
const Validation = require('../middlewares/validations')



//-----------------------------------GET---------------------------------

router.get('/',adminController.signinView)
router.get('/adminpanel',adminController.userView)
router.get('/viewproducts',sessionControl.adminSession,adminController.viewProducts)
router.get('/orders',sessionControl.adminSession,adminController.viewOrders)
router.get('/admin-dashboard',sessionControl.adminSession,adminController.viewDashboard)
router.get('/getOrdersbyDate',sessionControl.adminSession,adminController.viewOrders)
router.get('/downloadfile/:fromDate/:toDate',adminController.downloadFile)
router.get('/logout',adminController.logOUt)

//-----------------------------------POST-----------------------------------------------------------
router.post('/adminpanel/block/:id',sessionControl.adminSession,adminController.blockUser)
router.post('/adminpanel/unblock/:id',sessionControl.adminSession,adminController.unblockUser)

router.post('/signin',adminController.signIn)
router.post('/unlistproduct/:id',sessionControl.adminSession,adminController.deleteProduct) 
router.post('/listproduct/:id',sessionControl.adminSession,adminController.undeleteProduct)
router.post('/deletecategory/:id',sessionControl.adminSession,adminController.deleteCategory)
router.post('/deletelanguage/:id',sessionControl.adminSession,adminController.deleteLanguage)
router.post('/getOrdersbyDate',sessionControl.adminSession,adminController.getProductsbyDate)

//---------------------------------GET and POST----------------------------------------------------

router.route('/addproduct')
      .get(sessionControl.adminSession,adminController.addProductview)
      .post(Validation.productValidation,adminController.addProduct)


router.route('/viewcategory')
      .get(sessionControl.adminSession,adminController.viewCategory)
      .post(Validation.categoryValidation,adminController.addCategory)

router.route('/viewlanguages')
      .get(sessionControl.adminSession,adminController.viewLanguage)
      .post(Validation.languageValidation,adminController.addLanguage)


router.route('/editproduct/:id')
      .get(sessionControl.adminSession,adminController.editProductpage)
      .post(adminController.updateProduct)








module.exports = router