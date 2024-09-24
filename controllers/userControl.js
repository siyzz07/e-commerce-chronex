const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const moment = require("moment");
const { log } = require("console");
const Product=require('../models/porduct')
const Category=require('../models/category')
const Brand=require('../models/brand')

//---------------------------node mailer transporter set-------------------------

// set up nodemailer transport for otp
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "chronex123123@gmail.com", //my email
    pass: "jdbg ayvw rljt ljle", //password
  },
});
//--------------------------end---------------------------------------------

//-----------------------------------login page-----------------------------------

//  for load login page
const loadLogin = async (req, res) => {
  try {
    const fail = req.flash("fail");
    const success = req.flash("success");
    res.render("login", { success, fail });
  } catch (error) {
    console.log(error.message);
  }
};


//login verification
const verifyUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // console.log(`2222222${user.isVerified}`);

    if (user && user.isVerified == true) {
      const matchPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (matchPassword) {
        res.redirect("/home");
      } else {
        req.flash("fail", "invalied password");
        res.redirect("/login");
      }
    } else {
      req.flash("fail", "invalied email");
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//------------------------end--------------------------

//------------------------------------signup page--resent otp--otp --------

// for load sign up page
const loadSignup = async (req, res) => {
  try {
    const fail = req.flash("fail");
    const fail2 = req.flash("fail2");
    res.render("signup", { fail2, fail });
  } catch (error) {
    console.log(error.message);
  }
};



//in otp vatification page chek the two otp's are same or not
const otpVarificationCheck = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  try {
    if (!user) {
      req.flash("fail", "fill the signup detials");
      res.redirect("/signup");
    } else {
      if (user.otpexpire < Date.now()) {
        req.flash("fail", "otp expired");
        req.flash("email", req.body.email);
        // req.flash("otp", req.body.otp);
        res.redirect("/otp");
      } else {
        if (user.otp == req.body.userotp) {
          
          // Mark the user as verified if OTP is correct and not expired
          user.isVerified = true;
          user.otp = null; // Clear the OTP after successful verification
          user.otpexpire = null; // Clear the expiry time after successful verification
          await user.save();

          // Redirect to success page or login page after verification
          req.flash("success", "your account is created ");
          res.redirect("/login");
        } else {
        //   console.log("rtrtrtt");
        //   console.log(req.body.userotp);
        //   console.log(req.body.otp);

          req.flash("fail", "invalid otp");
          req.flash("email", req.body.email);
          req.flash("otp", req.body.otp);
          res.redirect("/otp");
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};



// for load otp varification
const otpVarification = async (req, res) => {
  try {
    const fail = req.flash("fail");
    // const otp = req.flash("otp")[0];
    const email = req.flash("email")[0];
    res.render("OTPverification", { fail, email });
  } catch (error) {
    console.log(error.message);
  }
};

// for inser users form  sign_up page
const insertUser = async (req, res) => {
  const { email, password, confirmpassword } = req.body;

  try {
    const existUser = await User.findOne({ email: req.body.email });
    //check user already exist or not
    if (existUser) {
      req.flash("fail", "user already exist");
      res.redirect("/signup");
    } else {
      //   check password and confirm passwords are same
      if (password != confirmpassword) {
        req.flash("fail2", "confirm password is incorrect");
        res.redirect("/signup");
      } else {
        const hasedpassword = await bcrypt.hash(password, 10); //hash password
        const otp = crypto.randomInt(100000, 999999).toString(); //generate random otp
        // const otpExpiry = moment().add(5, "minutes").toDate(); Set OTP expiry for 5 minutes
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          password: hasedpassword,
          otp: otp,
          otpexpire: Date.now() + 300000, //for otp expire time
          is_admin: 0,
        });

        const userData = await user.save();

        //send OTP to user's email
        await transporter.sendMail({
          from: "testbrocamp@gmail.com",
          to: email,
          subject: "Secure Your Account with This Code",
          text: `your OTP is ${otp}`,
        });
        // Redirect to OTP verification page, passing the email

        req.flash("email", email);
        // req.flash("otp", otp);
        res.redirect("/otp");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// resend otp
const resendOtp = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.query.email });

    if (!user) {
      req.flash("fail", "User not found");
      return res.redirect("/signup");
    }

    // Generate new OTP and update expiry time
    const newOtp = crypto.randomInt(100000, 999999).toString();
    

    user.otp = newOtp;
    user.otpexpire = Date.now() + 300000;
    await user.save();

    // Send new OTP to user's email
    await transporter.sendMail({
      from: "testbrocamp@gmail.com",
      to: user.email,
      subject: "Resend OTP",
      text: `Your new OTP is ${newOtp}`,
    });
    req.flash("email", req.query.email);
    // req.flash("otp", newOtp);
    res.redirect("/otp");
  } catch (error) {
    console.log(error.message);
  }
};
//----------------------------end-----------------------------
//-----------------------------------home page-------------------------------------

//load home
const loadHome = async (req, res) => {
  
  try {
    const product = await Product.find({ isBlocked: true }).populate('brandName')
   const category=await Category.find({isListed:true})
   const brand=await Brand.find({isListed:true})

    res.render("home",{product:product,category:category,brand:brand});
  } catch (error) {
    console.log(error.message);
  }
};

//------------------------------end-----------------------------------

//--------------------------------------product details-------------

//load product details page
const productDetails=async (req,res)=>{
  try {
    res.render('productDetails')
  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  loadLogin,
  loadSignup,
  otpVarification,
  insertUser,
  otpVarificationCheck,
  resendOtp,
  verifyUser,
  loadHome,
  productDetails
};
