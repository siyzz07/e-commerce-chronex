const express = require('express')
const session=require('express-session')
const userSession=require('../middlewares/userSession')
const user_route=express();

user_route.set("view engine","ejs");
user_route.set("views","./views/users")

user_route.use(express.static("public"))
user_route.use(express.static('public/users'))


user_route.use(
    session({
        secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    })
)




user_route.use(express.json())
user_route.use(express.urlencoded({extended:true}));

const userController=require("../controllers/userControl");

// login page
user_route.get("/login",userController.loadLogin)
user_route.post('/verifyuser',userController.verifyUser)

//logout
user_route.get('/logout',userController.logout)


// forgot password
user_route.get('/forgotemail',userController.getforgotPassword)
user_route.post('/forgotemail',userController.postforgotPassword)
user_route.get('/otpcheck',userController.getotpcheck)
user_route.post('/otpcheck',userController.postotpcheck)
user_route.get('/setpassword',userController.getSetPassword)
user_route.post('/setpassword',userController.postSetPassword)

// singup page
user_route.get("/signup",userController.loadSignup)
user_route.post('/register',userController.insertUser)

//otp page
user_route.get("/otp",userController.otpVarification)
user_route.post("/otpverification",userController.otpVarificationCheck)
user_route.get('/resendotp',userController.resendOtp)

//home page
user_route.get('/home',userSession,userController.loadHome)



// product details page
user_route.get('/productdetails',userSession,userController.productDetails)








module.exports=user_route