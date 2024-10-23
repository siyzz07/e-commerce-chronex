const express=require('express')
const session=require('express-session')
const admin_route=express()
const adminSession= require('../middlewares/adminSession')
const upload=require('../middlewares/imageUploadMulter')
const multer=require('multer')
const nocache=require('nocache')


admin_route.set("view engine","ejs");
admin_route.set("views","./views/admin")

admin_route.use(express.static("public"))
admin_route.use(nocache())

admin_route.use(express.json())
admin_route.use(express.urlencoded({extended:true}));

admin_route.use(
    session({
        secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    })
)

//-------------- CONTROLLER --------------------------------
const adminController=require('../controllers/adminControl')
const brandController=require('../controllers/brandControl')
const categoryController=require('../controllers/categoryContorl')
const productController=require('../controllers/productContorl')
const orderController=require('../controllers/orderControl')
const coupenController=require('../controllers/coupenController')
const offerController=require('../controllers/offerController')

// get loagin page and verify admim
admin_route.get("/login",adminController.loadAdminLogin)
admin_route.post('/adminVerify',adminController.adminVerify)


//logout
admin_route.get('/logout',adminSession,adminController.logoutAdmin)


//dashboard
admin_route.get('/dashboard',adminSession,adminController.dashboard)

//user data page 
admin_route.get('/userdata',adminSession,adminController.userData)
admin_route.get('/deleteuser',adminController.deleteUser)
admin_route.get('/unblockuser',adminController.unblockuser)
admin_route.get('/blockuser',adminController.blockuser)


// category page
admin_route.get('/category',adminSession,categoryController.category)
admin_route.get('/deletecategory',categoryController.deletCategory)
admin_route.get('/listcategory',categoryController.listCategory)
admin_route.get('/editcategory',categoryController.loadEditCategory)
admin_route.get('/unlistcategory',categoryController.unlistCategory)

admin_route.post('/addcategory',categoryController.addCategory)
admin_route.post('/editcategory',categoryController.editCategoryPost)

// admin_route.post('/editcategory',adminController.editCategoryPost)

//brand page
admin_route.get('/brand',adminSession,brandController.brand)

admin_route.get('/deletebrand',adminSession,brandController.deleteBrand)
admin_route.get('/listbrand',adminSession,brandController.listBrand)
admin_route.get('/unlistbrand',adminSession,brandController.unlistBrand)
admin_route.get('/editbrand',adminSession,brandController.editBrand)


admin_route.post('/editbrand',brandController.edit)
admin_route.post('/addbrand',brandController.addBrand)

//product list and   add product page 
admin_route.get('/product',adminSession,productController.getProduct)
admin_route.get('/addproduct',adminSession,productController.getAddProuduct)
admin_route.post('/addproduct',upload.array('images', 3),productController.postProduct)
admin_route.get('/blockproduct',productController.blockProduct)
admin_route.get('/unblockproduct',productController.unblockProduct)
admin_route.get('/editproduct',adminSession,productController.editproductGet)
admin_route.post('/editproduct',upload.array('images', 3),productController.editproductpost)
admin_route.get('/deleteproduct',productController.deletproduct)


//order 
admin_route.get('/orderList',adminSession,orderController.getOrderList)
admin_route.get('/orderDetails',adminSession,orderController.orderDeatails)
admin_route.post('/orderUpdate',orderController.orderUpdate)


// coupen 
admin_route.get('/coupen',adminSession,coupenController.getCoupenPage)
admin_route.get('/addCoupen',adminSession,coupenController.getAddCoupen)
admin_route.post('/addCoupen',coupenController.postAddCoupen)
admin_route.get('/deleteCoupen',adminSession,coupenController.deleteCoupen)


// offer
admin_route.get('/offer',offerController.offer)
admin_route.get('/addOffer',offerController.addOffer)
admin_route.post('/addOffer',offerController.postAddOffer)

module.exports=admin_route