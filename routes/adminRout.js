const express=require('express')
const session=require('express-session')
const admin_route=express()
const adminSession= require('../middlewares/adminSession')
const upload=require('../middlewares/imageUploadMulter')
const multer=require('multer')

admin_route.set("view engine","ejs");
admin_route.set("views","./views/admin")

admin_route.use(express.static("public"))



admin_route.use(
    session({
        secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    })
)

admin_route.use(express.json())
admin_route.use(express.urlencoded({extended:true}));

const adminController=require('../controllers/adminControl')

// get loagin page and verify admim
admin_route.get("/login",adminController.loadAdminLogin)
admin_route.post('/adminVerify',adminController.adminVerify)


//logout
admin_route.get('/logout',adminController.logoutAdmin)


//dashboard
admin_route.get('/dashboard',adminSession,adminController.dashboard)

//user data page 
admin_route.get('/userdata',adminSession,adminController.userData)
admin_route.get('/deleteuser',adminController.deleteUser)
admin_route.get('/unblockuser',adminController.unblockuser)
admin_route.get('/blockuser',adminController.blockuser)


// category page
admin_route.get('/category',adminSession,adminController.category)
admin_route.get('/deletecategory',adminController.deletCategory)
admin_route.get('/listcategory',adminController.listCategory)
admin_route.get('/editcategory',adminController.loadEditCategory)
admin_route.get('/unlistcategory',adminController.unlistCategory)

admin_route.post('/addcategory',adminController.addCategory)
admin_route.post('/editcategory',adminController.editCategoryPost)


//brand page
admin_route.get('/brand',adminSession,adminController.brand)

admin_route.get('/deletebrand',adminController.deleteBrand)
admin_route.get('/listbrand',adminController.listbrand)
admin_route.get('/unlistbrand',adminController.unlistBrand)
admin_route.get('/editbrand',adminController.editBrand)


admin_route.post('/editbrand',adminController.edit)
admin_route.post('/editcategory',adminController.editCategoryPost)
admin_route.post('/addbrand',adminController.addBrand)

//product list and   add product page 
admin_route.get('/product',adminSession,adminController.getProduct)
admin_route.get('/addproduct',adminSession,adminController.getAddProuduct)
admin_route.post('/addproduct',upload.array('images', 3),adminController.postProduct)
admin_route.get('/blockproduct',adminController.blockProduct)
admin_route.get('/unblockproduct',adminController.unblockProduct)
admin_route.get('/editproduct',adminController.editproductGet)
admin_route.post('/editproduct',upload.array('images', 3),adminController.editproductpost)
admin_route.get('/deleteproduct',adminController.deletproduct)



module.exports=admin_route