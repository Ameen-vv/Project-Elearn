var express = require('express')
var logger = require('morgan')
var path = require('path')
var ejs = require('ejs')
var cookieParser= require('cookie-parser')
var createError = require('http-errors');
const db = require('./config/connection')
const multer = require('multer')
const session = require('express-session')
require('dotenv').config()

//-------routes-----------------------------------------------------------------
const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')


const app = express();


app.use((req,res,next)=>{
    res.header('Cache-Control','private,no-cache,no-store,must-revalidate');
    next();
  });

//view-engine
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')


app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname , 'public')));
db.connect()
app.use(session({secret:"secret",cookie:{maxAge:6000000},saveUninitialized:true,resave:true}))



const fileStorage=multer.diskStorage({
  destination:(req,file,callback)=>{
    if(file.fieldname==='image'){
      callback(null,'public/assets/images/thumbnails/')
    }else if(file.fieldname==='video'){
      callback(null,'public/assets/course-videos')
    }
   
  },
  filename:(req,file,callback)=>{
    callback(null, file.fieldname +"_" + Date.now() + path.extname(file.originalname))
    // console.log(new Date().toISOString() + "_"+file.originalname);
  }
})

app.use(multer({storage:fileStorage}).fields([{name:'image',maxCount:1},{name:'video',maxCount:3}]))



app.use('/admin',adminRouter)
app.use('/',userRouter)
app.use(function(req, res, next) {
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('Error');
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.json({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});



app.listen(2000,()=>{
    console.log('server connected on port 2000');
})