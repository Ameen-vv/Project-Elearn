const router = require("../routes/admin")
const userModel= require('../model/userSchema')

module.exports={
    userBlocked:async(req,res,next)=>{
        let id = req.session.userId
        if(id){
            let user = await userModel.findById({_id:id})
            if(user.block){
                req.session.destroy()
                res.redirect('/')

            }else{
                console.log('test')
                next()
            }
        }else{
            console.log('tes2')
            next()
        }


        
    }
}