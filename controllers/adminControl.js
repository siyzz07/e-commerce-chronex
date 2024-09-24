const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const Category = require("../models/category");
const Brand=require('../models/brand')
const Product=require("../models/porduct")

const email = "admin@gmail.com";
const password = "12345";
//--------------------------------login ---------------------------------
// load admin login page
const loadAdminLogin = async (req, res) => {
  try {
    const fail = req.flash("fail");
    res.render("login", { fail });
  } catch (error) {
    console.log(error.message);
  }
};

//veify the admin from the login
const adminVerify = async (req, res) => {

  try {
    
    if (email == req.body.email) {

      if (req.body.password == password) {
        req.session.admin=email
        res.redirect("/admin/dashboard");
      } else {
        req.flash("fail", "wrong password");
        res.redirect("/admin/login");
      }
    } else {
      req.flash("fail", "admin not exist");
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.log(error.message);
  }
  
  
};
//--------------------end------------------------------------------------------------------

//l---------------------------logout---------------------------------------
const logoutAdmin=async(req,res)=>{
  try {
    req.session.destroy();
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error.message);
  }
}

//-------------end----------------------------

//---------------------------------dashboard--------------------------------
// load dashboard page
const dashboard = async (req, res) => {
  try {
    res.render("home");
  } catch (error) {
    console.log(error.message);
  }
};


//---------------------------userdata list---------------------------------------------

// load user list page
const userData = async (req, res) => {
  const users = await User.find({ isVerified: true });
  try {
    const msg = req.flash("msg");
    res.render("userDetails", { user: users, msg });
  } catch (error) {
    console.log(error.message);
  }
};


//delete user form the userlist page after clicing the delet button
const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userdelete = await User.findByIdAndDelete({ _id: id });

    req.flash("msg", "user deleted successfully");
    res.redirect("/admin/userdata");
  } catch (error) {
    console.log(error.message);
  }
};


// unblock user
const unblockuser = async (req, res) => {
  try {
    const id = req.query.id;
    const unblock = await User.findByIdAndUpdate(id, { isBlocked: true });
    res.redirect("/admin/userdata");
  } catch (error) {
    console.log(error.message);
  }
};


//block user
const blockuser = async (req, res) => {
  try {
    const id = req.query.id;

    const block = await User.findByIdAndUpdate(id, { isBlocked: false });
    console.log(block);

    res.redirect("/admin/userdata");
  } catch (error) {
    console.log(error.message);
  }
};

//-----------------------------end--------------------
//-------------------------------------catetory------------

// load categorys page
const category = async (req, res) => {
  const category = await Category.find({});
  // console.log(category);

  try {
    const msg1 = req.flash("msg1");
    const fail = req.flash("fail");
    const msg = req.flash("msg");
    res.render("categorys", { category: category, msg, fail, msg1 });
  } catch (error) {
    console.log(error.message);
  }
};

// add category in category pages
const addCategory = async (req, res) => {
  const category = await Category.findOne({ category: req.body.category });

  try {
    if (category) {
      req.flash("fail", "category already added");
      res.redirect("/admin/category");
    } else {
      const category = new Category({
        category: req.body.category,
        description: req.body.description,
      });
      const insertedCategory = await category.save();

      req.flash("msg", "category added");
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// delete the categories
const deletCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const deletCategory = await Category.findByIdAndDelete({ _id: id });
    req.flash("msg1", "category deleted successfully");
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

// list category
const listCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const listCategory = await Category.findByIdAndUpdate(id, {
      isListed: true,
    });
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

// unlist category
const unlistCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const unlist = await Category.findByIdAndUpdate(id, { isListed: false });
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

// load edit category page
const loadEditCategory=async (req,res)=>{
  try {
   const id=req.query.id;
   const updateCategoryData=await Category.findOne({_id:id})
   if(updateCategoryData){
    res.render('editCategory',{data:updateCategoryData})
   }else{
    res.redirect('/admin/category')
   }
  } catch (error) {
    console.log(error.message);
  }
}


// post the edit category page 
const editCategoryPost=async (req,res)=>{
  try {
    const edit=await Category.findByIdAndUpdate(
      {_id:req.body.id},{
        $set:{
          category:req.body.category,
          description:req.body.description
        }
      }
    )
    if(edit){
      req.flash('msg1','Category updated successfully')
      res.redirect('/admin/category')
    }
   } catch (error) {
     console.log(error.message);
   }
}

//-------------------------end---------------------------
//--------------------------------brand------------------------


// load brand page
const brand = async (req, res) => {
  const brand = await Brand.find();
  try {
    const msg1 = req.flash("msg1");
    const fail = req.flash("fail");
    const msg = req.flash("msg");
    res.render("brand", { brand: brand, msg, fail, msg1 });
  } catch (error) {
    console.log(error.message);
  }
};

//add brands in brand page
const addBrand = async (req, res) => {
  const brandcheck = await Brand.findOne({ brand: req.body.brand });
  try {
    if (brandcheck) {
      req.flash("fail", "Bradn already added");
      res.redirect("/admin/brand");
    } else {
      const brand = new Brand({
        brand: req.body.brand,
        description: req.body.description,
      });
      const insertedbradnd = await brand.save();
      req.flash("msg", "Brand added");
      res.redirect("/admin/brand");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//delete brand
const deleteBrand = async (req, res) => {
  try {
    const id = req.query.id;
    const deletebrand = await Brand.findByIdAndDelete({ _id: id });
    req.flash("msg1", "Brand deleted successfully");
    res.redirect("/admin/brand");
  } catch (error) {
    console.log(error.message);
  }
};

//list brand
const listbrand = async (req, res) => {
  try {
    const id = req.query.id;
    const listbrand = await Brand.findByIdAndUpdate(id, { isListed: true });
    res.redirect("/admin/brand");
  } catch (error) {
    console.log(error.message);
  }
};

// unlist brand
const unlistBrand = async (req, res) => {
  try {
    const id = req.query.id;
    const unslistbrand = await Brand.findByIdAndUpdate(id, { isListed: false });
    res.redirect("/admin/brand");
  } catch (error) {
    console.log(error.message);
  }
};

//load edit brand page
const editBrand = async (req, res) => {
  try {
    const id = req.query.id;
    const updateBrandData = await Brand.findOne({ _id: id });

    if (updateBrandData) {
      res.render("editBrand", { data: updateBrandData });
    } else {
      res.redirect("/admin/brand");
    }
  } catch (error) {
    console.log(error.message);
  }
};

///post the edit page editing the page
const edit = async (req, res) => {
  try {
    const edit = await Brand.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          brand: req.body.brand,
          description: req.body.description,
        },
      }
    );

    if (edit) {
      req.flash("msg1", "Brand updated successfully");
      res.redirect("/admin/brand");
    }
  } catch (error) {
    console.log(error.message);
  }
};
//------------------------------end----------------------------

//--------------------------------------product page and add product page-------------------

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
    console.log(saveProduct);
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


const editproductpost=async (req,res)=>{
  
  try {
   
    
    const images = req.files.map(file => file.filename);
   const editproduct=await Product.findByIdAndUpdate(
    {_id:req.body.id},
    {
      title:req.body.title,
      description:req.body.description,
      color:req.body.color,
      brandName:req.body.brand,
      category:req.body.category,
      stock:req.body.stock,
      price:req.body.price,
      images:images
    }
   )
   if(editproduct){
    req.flash('msg','product edited succsessfully')
    res.redirect('/admin/product')
   }

  
   } catch (error) {
     console.log(error.message);
   }
}


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

//------------------------------- end------------

module.exports = {
  loadAdminLogin,
  adminVerify,
  dashboard,
  userData,
  deleteUser,
  unblockuser,
  blockuser,
  category,
  addCategory,
  deletCategory,
  unlistCategory,
  listCategory,
  brand,
  addBrand,
  deleteBrand,
  listbrand,
  unlistBrand,
  editBrand,
  edit,
  loadEditCategory,
  editCategoryPost,
  getAddProuduct,
  logoutAdmin,
  postProduct,
  getProduct,
  blockProduct,
  unblockProduct,
  editproductGet,
  editproductpost,
  deletproduct,

};
