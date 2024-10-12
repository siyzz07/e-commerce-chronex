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


//--------------- CONTROLLER ------------------------
const userController=require("../controllers/userControl");
const addressController=require("../controllers/addressController")
const orderController=require('../controllers/orderControl')
const cartController=require('../controllers/cartControl')


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

//user account page 
user_route.get('/userAccount',userSession,userController.account)
user_route.put('/editUser',userController.postEditUser)

//change password
user_route.get('/changePassword',userSession,userController.getChangePassword)
user_route.put('/changePassword',userController.postChangePassword)


//address
user_route.get('/address',userSession,addressController.getAddress)
user_route.get('/addAddress',userSession,addressController.getAddAddress)
user_route.post('/addAddress',addressController.postAddAddres)
user_route.get('/deleteAddress',userSession,addressController.deletAddress)
user_route.get('/editAddress',userSession,addressController.editAddress)
user_route.post('/editAddress',addressController.postEditAddress)





// cart and 
user_route.post('/addToCart',cartController.addToCart)//this post come from the product details page 
user_route.get('/cart',userSession,cartController.getCart)
user_route.post('/updateCart',cartController.updateCart)
user_route.get('/deletFromCart',cartController.deleFromCart)


// chekout    order placing 
user_route.get('/checkOut',userSession,orderController.getCheckOut)
user_route.post('/submit-payment',orderController.placeOrder)
user_route.get('/confirmorder',orderController.confirmOrder)


// show order page
user_route.get('/order',userSession,orderController.getOrderHistory)
user_route.get('/orderDetails',userSession,orderController.getOrderDeatails)
user_route.get('/cancelOrder',orderController.cancelOrder)

// shop page
user_route.get('/shop',userSession,userController.getShop)


module.exports=user_route