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

admin_route.get('/deletebrand',brandController.deleteBrand)
admin_route.get('/listbrand',brandController.listBrand)
admin_route.get('/unlistbrand',brandController.unlistBrand)
admin_route.get('/editbrand',brandController.editBrand)


admin_route.post('/editbrand',brandController.edit)
admin_route.post('/addbrand',brandController.addBrand)

//product list and   add product page 
admin_route.get('/product',adminSession,productController.getProduct)
admin_route.get('/addproduct',adminSession,productController.getAddProuduct)
admin_route.post('/addproduct',upload.array('images', 3),productController.postProduct)
admin_route.get('/blockproduct',productController.blockProduct)
admin_route.get('/unblockproduct',productController.unblockProduct)
admin_route.get('/editproduct',productController.editproductGet)
admin_route.post('/editproduct',upload.array('images', 3),productController.editproductpost)
admin_route.get('/deleteproduct',productController.deletproduct)



module.exports=admin_route