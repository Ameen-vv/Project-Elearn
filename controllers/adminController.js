const express = require('express')
const userHelper = require('./helpers/userHelper')
const router = express.Router()
const productHelper = require('../controllers/helpers/productHelper')
const product = require('../model/productSchema')
const category = require('../model/categorySchema')
const language = require('../model/languageSchema')
const orderModel=require('../model/orderSchema')
const userModel= require('../model/userSchema')
const cloudinary=require('cloudinary').v2
let fs = require('fs')
const { response, json } = require('express')

cloudinary.config({
    secure:true
})


module.exports={
    signinView:(req,res)=>{
        if(req.session.adminLogged){
            res.redirect('/admin/adminpanel')
        }else{
            let err=req.session.passErr
            console.log(process.env.CHECK_ENV);
            res.render('admin/admin',{err})
        }
    },
    signIn:(req,res)=>{
        const admins={
            email:'ameen@gmail.com',
            password:"1234"
        
        }
        if(req.body.email==admins.email && req.body.password==admins.password){
            req.session.adminLogged=true
            req.session.passErr=false
            userHelper.viewUser().then((userList)=>{
                res.redirect('/admin/admin-dashboard')
             })
        }else{
            req.session.passErr=true
            res.redirect('/admin')
        }
    },
    userView:(req,res)=>{
        if(req.session.adminLogged){
        userHelper.viewUser().then((userList)=>{
           let users = userList
           res.render('admin/view-user',{users})
        })
    }else{
        res.redirect('/admin')
    }
    },
    blockUser:(req,res)=>{
        let userId=req.params.id
        userHelper.blockUser(userId).then(()=>{


        res.redirect('/admin/adminpanel')
    })
    
    },
    unblockUser:(req,res)=>{
        let userId=req.params.id
        userHelper.unblockUser(userId).then(()=>{
            res.redirect('/admin/adminpanel')
        })
        
        },
    logOUt:(req,res)=>{
            req.session.destroy()
            res.redirect('/admin')

        },
    viewProducts:async(req,res)=>{
        // console.log('start');
        let products = await product.find({}).populate('category', 'name').populate('language','language').sort({date:-1}) 
        // console.log('end');
        // console.log(products);
        res.render('admin/view-products',{products,index: 1})
    },
    addProductview:async(req,res)=>{
        let categories = await category.find()
        let languages = await language.find()
        let productErr=false
        res.render('admin/add-products',{categories,languages,productErr})
    },
    addProduct:async(req,res)=>{
        let imageName=await req.files.image[0].filename
        let videoArr=[]
        if(req.files.video){
            let video=req.files.video
            let length=video.length
            for(i=0;i<length;i++){
                var up_options = {resource_type: "video", 
            eager: [
            { streaming_profile: "full_hd", format: "m3u8" }],                                   
            eager_async: true,
            eager_notification_url: "https://mysite.example.com/notify_endpoint",
            public_id: `Elearn/courseVideos/${req.body.name}-${i}`}
            await cloudinary.uploader
            .upload(video[i].path, up_options)
            .then((result)=>{
                
                console.log(result)
                videoArr.push(result)
            
            }).then(()=>{
                fs.unlink(video[i].path,(err)=>{
                    if(!err){
                        console.log('file deleted');
                    }
                })
            })
                  

            }
            console.log('uploaded',videoArr);
        }
       
        productHelper.addProduct(req.body,imageName,videoArr).then((response)=>{
            if(response.status){
                res.redirect('/admin/viewproducts')
            }else{
                res.send('failed')
            }
        })
    },
    addCategory:(req,res)=>{
        productHelper.addCategory(req.body).then((response)=>{
            if(response.status){
                res.redirect('/admin/viewcategory')
            }
            else{
                res.send('error')
            }
        })
    },
    viewCategory:async(req,res)=>{
        let categoryErr = false
        let categories = await category.find()
        res.render('admin/viewCategory',{categories,categoryErr})

    },
    viewLanguage:async(req,res)=>{
        let languages = await language.find()
        let languageErr=false
        res.render('admin/viewLanguage',{languages,languageErr})
    },
    addLanguage:(req,res)=>{
        productHelper.addLanguage(req.body).then((response)=>{
            if(response.status){
                res.redirect('/admin/viewlanguages')
            }
            else{
                res.send('error')
            }  
        })
    },
    deleteProduct:async(req,res)=>{
        let productId = req.params.id
        await product.updateOne({_id:productId},{$set:{listed:false}})
        res.redirect('/admin/viewproducts')
        
      
    },
    deleteCategory:async(req,res)=>{
        let id = req.params.id
        await category.findByIdAndDelete({_id:id})
        res.redirect('/admin/viewcategory')
    },
    deleteLanguage:async(req,res)=>{
        let id = req.params.id
        await language.findByIdAndDelete({_id:id})
        res.redirect('/admin/viewlanguages')

    },
    editProductpage:async(req,res)=>{
        let id = req.params.id
        let products= await product.findById({_id:id}).populate('category','name').populate('language','language')
        let categories = await category.find()
        let languages = await language.find()
        res.render('admin/edit-product',{products,categories,languages})

    },
    updateProduct:async(req,res)=>{
        let id = req.params.id
        let image
        let videoArr=[]
        if(req.files.image){
             image = req.files.image[0].filename
        }else{
            image=null
        }
        if(req.files.video){
            console.log(req.files.video);
            let video=req.files.video
            let length=video.length
            for(i=0;i<length;i++){
                var up_options = {resource_type: "video", 
            eager: [
            { streaming_profile: "full_hd", format: "m3u8" }],                                   
            eager_async: true,
            eager_notification_url: "https://mysite.example.com/notify_endpoint",
            public_id: `Elearn/courseVideos/${req.body.name}-${i}`};
            await cloudinary.uploader
            .upload(video[i].path, up_options)
            .then((result)=>{
                
                console.log(result)
                videoArr.push(result)
            
            }).then(()=>{
                fs.unlink(video[i].path,(err)=>{
                    if(!err){
                        console.log('file deleted');
                    }
                })
            })
                  

            }
            console.log('uploaded',videoArr);
            
            
        }else{
            videoArr=null
        }
        let data = req.body
        productHelper.editProduct(id,data,image,videoArr).then((response)=>{
            if(response.status){
                res.redirect('/admin/viewproducts')
            }else{
                res.send('error in update')
            }
        })
    },
    undeleteProduct:async(req,res)=>{
        let productId = req.params.id
        await product.updateOne({_id:productId},{$set:{listed:true}})
        res.redirect('/admin/viewproducts')
        
      
    },
    viewOrders:async(req,res)=>{
        let orders = await orderModel.find({}).populate('user','email').populate('products','courseName').sort({date:-1})
        let fromDate=0
        let realToDate=0
        let toDateRef=0
        res.render('admin/view-orders',{orders,fromDate,realToDate,toDateRef})
  },
  viewDashboard:async(req,res)=>{
        let user = await userModel.find()
        let userCount=user.length
        let products = await product.find()
        let productCount=products.length
        let latestOrders=await orderModel.find().limit(5).sort({date:-1}).populate('user','email').populate('products','courseName')
        let sum=0
        let orders=await orderModel.find()
        if(orders){
            for(let i=0;i<orders.length;i++){
                sum=sum+orders[i].total
            }
            sum=Math.round(sum)
        }


        
        res.render('admin/dashboard',{userCount,productCount,latestOrders,sum})
  },
  getProductsbyDate:async(req,res)=>{
    let fromDate=req.body.fromDate
    let toDateRef=req.body.toDate
    let toDate=new Date(toDateRef)
    let realToDate=toDate.setDate(toDate.getDate() + 1);
    console.log(realToDate);
    let orders = await orderModel.find({date:{$gte:fromDate,$lte:realToDate}}).populate('user','email').populate('products','courseName').sort({date:-1})
    res.render('admin/view-orders',{orders,fromDate,realToDate,toDateRef})


  },
  downloadFile:async(req,res)=> {

    let orders
    let fromDate = req.params.fromDate
    let toDate= req.params.toDate
    if(fromDate==0||toDate==0){
        orders = await orderModel.find({}).populate('user','email').populate('products','courseName').sort({date:-1})
    }else{
        orders = await orderModel.find({date:{$gte:fromDate,$lte:toDate}}).populate('user','email').populate('products','courseName').sort({date:-1})
    }
    generatePdf(orders).then((response)=>{
        if(response.status){
            let path = require("path");
            
            const filePath=path.resolve(__dirname,'../report.pdf')
            fs.readFile(filePath,(err,file)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log('started');
                    res.setHeader('Content-Type','application/pdf')
                    res.setHeader('Content-Disposition','attachement;filename="report.pdf"')
                    res.send(file)
                }
            })
            

            
        }else{
            res.send('failed')
        }
    })
   
}
    
}




function generatePdf(orders){
    let ejs = require("ejs");
    let pdf = require("html-pdf");
    let path = require("path");
    return new Promise((resolve,reject)=>{
        let response={}
        ejs.renderFile(path.resolve(__dirname, '../views/admin/downloadOrders.ejs'), {orders}, (err, data) => {
            console.log(data);
            if (err) {
                 response.status=false
                  resolve(response)
            } else {
                let options = {
                    "height": "11.25in",
                    "width": "12in",
                    "header": {
                        "height": "20mm"
                    },
                    "footer": {
                        "height": "20mm",
                    },
                };
                pdf.create(data, options).toFile("report.pdf", function (err, data) {
                    if (err) {
                        resolve(response)
                    } else {
                        response.status=true
                        resolve(response)
                    }
                });
            }
        });
    })
    
}