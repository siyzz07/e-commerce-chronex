const express = require('express')
const session=require('express-session')
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

// singup page
user_route.get("/signup",userController.loadSignup)
user_route.post('/register',userController.insertUser)

//otp page
user_route.get("/otp",userController.otpVarification)
user_route.post("/otpverification",userController.otpVarificationCheck)
user_route.get('/resendotp',userController.resendOtp)

//home page
user_route.get('/home',userController.loadHome)



// product details page
user_route.get('/productdetails',userController.productDetails)








module.exports=user_route