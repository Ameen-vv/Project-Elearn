module.exports={
    adminSession:(req,res,next)=>{
        if(req.session.adminLogged){
            next()
        }else{
            res.redirect('/admin')
        }
    },
    userSession:(req,res,next)=>{
        if(req.session.loggedIn){
            next()
        }else{
            res.redirect('/signin')
        }
    }
}