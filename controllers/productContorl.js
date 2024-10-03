const Product=require('../models/porduct')
const Category = require("../models/category");
const Brand=require('../models/brand')






// get product page 
const getProduct=async (req,res)=>{
    try {
      const product=await Product.find()
      const msg=req.flash('msg')
      res.render('product',{product:product,msg})
     } catch (error) {
       console.log(error.message);
     }
  }




// add porduct page get
const getAddProuduct=async (req,res)=>{
    try {
      const category=await Category.find()
      const brand=await  Brand.find()
      const fail=req.flash('fail')
      const msg=req.flash('msg')
      res.render('addProduct',{category:category,brand:brand,msg,fail})
     } catch (error) {
       console.log(error.message);
     }
  }
  

  // post add product, inset new product
const postProduct=async(req,res)=>{
    const checkProduct=await Product.findOne({title:req.body.title})
    try {
      if(checkProduct){
          req.flash('fail','the product is already added')
          res.redirect('/admin/addproduct')
      }else{
  
      const images = req.files.map(file => file.filename);
      const product=new Product({
        title:req.body.title,
        description:req.body.description,
        color:req.body.color,
        brandName:req.body.brand,
        category:req.body.category,
        stock:req.body.stock,
        price:req.body.price,
        images:images
      })
      const saveProduct=await product.save();
      // console.log(saveProduct);
      req.flash('msg','product added successfully')
      res.redirect('/admin/addproduct')
     }
     } catch (error) {
       console.log(error.message);
     }
  }
  
  // block product in product page
  const blockProduct=async (req,res)=>{
    try {
      const id=req.query.id
      const block=await Product.findByIdAndUpdate(id, {isBlocked: false})
      return res.redirect("/admin/product")
     } catch (error) {
       console.log(error.message);
     }
  }
  
  // block unbockproduct in product page
  const unblockProduct=async (req,res)=>{
    try {
      const id=req.query.id;
      const unblock=await Product.findByIdAndUpdate(id,{isBlocked:true})
      return res.redirect("/admin/product")
     } catch (error) {
       console.log(error.message);
     }
  }
  
  //------------------------------------------------edit product 
  
  // edit product get page 
  const editproductGet=async (req,res)=>{
    try {
      const id=req.query.id;
      const editproduct=await Product.findOne({_id:id});
      const category=await Category.find()
      const brand=await Brand.find()
      if(editproduct){
        
        
        res.render('editProduct',{ product:editproduct,brand:brand,category:category })
      }else{
          res.redirect('/admin/product')
      }
    
     } catch (error) {
       console.log(error.message);
     }
  }
  
  
  
  //////////////////////////////////////////////////////////
  
  const editproductpost = async (req, res) => {
    try {
      const id=req.body.id
   
      let images =
        req.files.length > 0 ? req.files.map((file) => file.filename) : undefined;
  
  
      const updatedProduct = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        brand: req.body.brand,
        stock: req.body.stock,
        price: req.body.price,
      };
      if (images) {
        updatedProduct.images = images;
      }
      await Product.findByIdAndUpdate(id, updatedProduct);
  
      res.redirect("/admin/product");
    } catch (error) {
      console.log(error.message);
    }
  };
  

  // delete product
const deletproduct=async (req,res)=>{
    try {
     const id=req.query.id;
     const deleteproduct=await Product.findByIdAndDelete({_id:id});
     req.flash('msg',"delete successfully")
     res.redirect("/admin/product")
    
     } catch (error) {
       console.log(error.message);
     }
  }



  module.exports={
    getProduct,
    getAddProuduct,
    postProduct,
    blockProduct,
    unblockProduct,
    editproductGet,
    editproductpost,
    deletproduct
  }