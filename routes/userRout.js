const express = require('express')
const session=require('express-session')
const userSession=require('../middlewares/userSession')
// const ensureAuthenticated  = require('../middleware/authMiddleware');  // Import middleware
const passport = require('passport');
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


//------------------ CONTROLLER ------------------------
const userController=require("../controllers/userControl");
const addressController=require("../controllers/addressController")
const orderController=require('../controllers/orderControl')
const cartController=require('../controllers/cartControl')
const wishlistContoller=require('../controllers/wishlistControll')
const coupenController=require('../controllers/coupenController')
const walletController=require('../controllers/walletControll')






// landing page 
user_route.get("/",userController.landinPage)
user_route.get("/landingproductdetails",userController.landingProduct)

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
user_route.get('/resendotpforPassword',userController.resendOtpForPassword)
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
user_route.get('/deletFromCart',userSession,cartController.deleFromCart)


// chekout    order placing 
user_route.get('/checkOut',userSession,orderController.getCheckOut)
user_route.post('/submit-payment',orderController.placeOrder)/////////////////////////////////////////////----------------
user_route.get('/confirmorder',userSession,orderController.confirmOrder)


// show order page
user_route.get('/order',userSession,orderController.getOrderHistory)
user_route.get('/orderDetails',userSession,orderController.getOrderDeatails)
user_route.get('/cancelOrder',userSession,orderController.cancelOrder)
user_route.post('/returnProduct',orderController.retrunProduct)

// shop page
user_route.get('/shop',userSession,userController.getShop)



// google auth

//initiate Google login
user_route.get('/google',passport.authenticate('google', { scope: ['profile','email'],prompt: 'select_account' }));
// handle Google callback =======after Google login
user_route.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), userController.googleAuth);




// wishlist
user_route.get('/addToWishlist',userSession,wishlistContoller.addWishlist)//add to wish list from product page
user_route.get('/wishlist',userSession,wishlistContoller.getWishlist)
user_route.get('/addWishlistToCart',userSession,cartController.addToCartFromWishlist)// from the wishlist .add wish list product to cart .//is controller is written in cartcontroller 
user_route.get('/deleteFromWishlist',userSession,wishlistContoller.deleFromWishlist)



// coupen
user_route.get('/applyCoupen',coupenController.applyCoupen)
user_route.get('/deletCoupen',userSession,coupenController.deletCoupen)


// razorpay
user_route.post('/createOrder', orderController.createOrder);/////////////////////----------------
user_route.post('/verifyPayment',orderController.verifyPayment);
user_route.post('/logOrderCancellation', orderController.logOrderCancellation);


//wallet
user_route.get('/wallet',userSession,walletController.getWallet)


// search 
// user_route.get('/search',userController.search)



// invoice 
user_route.get('/invoice',userSession,orderController.invoiceGet)



// retry order
user_route.post('/createOrderRetry',orderController.createOrderRetry)
user_route.post('/verifyPamentRetry',orderController.verifyPaymentRetry)


//404
// user_route.get('/*',userController.pageNotFound)

module.exports=user_route