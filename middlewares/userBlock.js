const router = require("../routes/admin")
const userModel= require('../model/userSchema')

module.exports={
    userBlocked:async(req,res,next)=>{
        let id = req.session.userId
        console.log(id)
        if(id){
            let user = await userModel.findById({_id:id})
            if(user.block){
                req.session.destroy()
                res.redirect('/')

            }else{
                next()
            }
        }else{
            next()
        }


        
    }
}