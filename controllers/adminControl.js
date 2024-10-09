const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const Category = require("../models/category");
const Brand=require('../models/brand')
const Product=require("../models/porduct")
const Admin=require('../models/adminModel')

const email = "admin@gmail.com";
// const password = "12345";



//-------------------------------------------------- LOGIN --------------------------------------------------------------

// load admin login page
const loadAdminLogin = async (req, res) => {
  try {
    if(!req.session.admin){
    const fail = req.flash("fail");
    res.render("login", { fail });
    }else{
      res.redirect('/admin/dashboard')
    }  
  } catch (error) {
    console.log(error.message);
  }
};

//veify the admin from the login
const adminVerify = async (req, res) => {

  try {
    
    const admin=await Admin.findOne({email:email})

    if (admin.email == req.body.email) {

      if (req.body.password == admin.password) {
        req.session.admin= admin.email
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
//------------------------------------------------------ END ------------------------------------------------------------------

//l------------------------------------------------ LOGOUT ----------------------------------------------------------
const logoutAdmin=async(req,res)=>{
  try {
    req.session.destroy();
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error.message);
  }
}

//------------------------------------------------------ END ------------------------------------------------------------------

//--------------------------------------------- DASHBOARD --------------------------------------------------------------------------------

// load dashboard page
const dashboard = async (req, res) => {
  try {
    res.render("home");
  } catch (error) {
    console.log(error.message);
  }
};

//----------------------------------------------------------------- END ------------------------------------------------------------------
//-------------------------------------------------USER DATA LIST ---------------------------------------------------------------------------

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
    const unblock = await User.findByIdAndUpdate(id, { isBlocked: false });////
    res.redirect("/admin/userdata");
  } catch (error) {
    console.log(error.message);
  }
};


//block user
const blockuser = async (req, res) => {
  try {
    const id = req.query.id;

    const block = await User.findByIdAndUpdate(id, { isBlocked: true });///
    // console.log(block);

    res.redirect("/admin/userdata");
  } catch (error) {
    console.log(error.message);
  }
};

//------------------------------------------------------ END ------------------------------------------------------------------




module.exports = {
  loadAdminLogin,
  adminVerify,
  dashboard,
  userData,
  deleteUser,
  unblockuser,
  blockuser,
  logoutAdmin,
};
