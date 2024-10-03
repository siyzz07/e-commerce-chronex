const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const moment = require("moment");
const { log } = require("console");
const Product=require('../models/porduct')
const Category=require('../models/category')
const Brand=require('../models/brand')
const UserOtpStore=require('../models/userOtpVerification')







//-------------------------------------------------- LOGIN PAGE --------------------------------------------------------------------------

//  for load login page
const loadLogin = async (req, res) => {
  try {
    if(req.session.user){
      res.redirect('/home')
    }else{
    const fail = req.flash("fail");
    const success = req.flash("success");
    res.render("login", { success, fail });
  }
  } catch (error) {
    console.log(error.message);
  }
};


//login verification
const verifyUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const email=req.body.email

    if (user && user.isVerified == true) {
      if(user.isBlocked == false){
      const matchPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (matchPassword) {
        req.session.user=email
        res.redirect("/home");
      } else {
        req.flash("fail", "invalied password");
        res.redirect("/login");
      }
    }else{
      req.flash('fail','Your account blocked by admin')
      res.redirect('/login')
    }
    } else {
      req.flash("fail", "invalied email");
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//-------------------------------------------------------  END  -----------------------------------------------------------
//-----------------------------------------  NODE MAILER  TRANSPORTER SET  ----------------------------------------------

// set up nodemailer transport for otp
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "chronex123123@gmail.com", //my email
    pass: "jdbg ayvw rljt ljle", //password
  },
});


//---------------------------------------------------------------  END  -----------------------------------------------------------------
//------------------------------------ SIGNUP PAGE -- OTP -- RESENT OTP ----------------------------------------------------------

// for load sign up page
const loadSignup = async (req, res) => {
  try {
    if(req.session.user){
      res.redirect('/home')
    }else{
    const fail = req.flash("fail");
    const fail2 = req.flash("fail2");
    res.render("signup", { fail2, fail });
    }
  } catch (error) {
    console.log(error.message);
  }
};



// for inser users form  sign_up page
const insertUser = async (req, res) => {
  try {
    const { email, password, confirmpassword } = req.body;
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


        const user = new User({
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          password: hasedpassword,
          is_admin: 0,
        });

        const userData = await user.save();
       const  userDataId=userData._id


          const storeOtp=await new  UserOtpStore({
            userId:userDataId,
            otp:otp,
            otpexpire:Date.now()+300000

          })
          await storeOtp.save()
        
          
        //send OTP to user's email
        await transporter.sendMail({
          from: "testbrocamp@gmail.com",
          to: email,
          subject: "Secure Your Account with This Code",
          text: `your OTP is ${otp}`,
        });


        // Redirect to OTP verification page, passing the email
        res.redirect(`/otp?id=${userDataId}`);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};




// for load otp varification
const otpVarification = async (req, res) => {
  try {
    const id=req.query.id;
    if(id){   
    const fail = req.flash("fail");
    res.render("OTPverification", { fail, id });
  }else{
    res.redirect('/signup')
  }
  } catch (error) {
    console.log(error.message);
  }
};



//in otp vatification page chek the two otp's are same or not
const otpVarificationCheck = async (req, res) => {
  
  try {
    const id=req.body.id
    
    const user = await User.findOne({ _id: id});  
    const userOtp=await UserOtpStore.findOne({userId:id})

    if (!user) {
        
      req.flash("fail", "fill the signup detials");
      res.redirect("/signup");
    } else {
  
      if (user.otpexpire < new Date()) {
        req.flash("fail", "otp expired");
        res.redirect(`/otp?id=${id}`);
      } else {

        if (userOtp.otp == req.body.userotp) {
          
          // Mark the user as verified if OTP is correct and not expired && delete the otp form the the otp store database
          await User.updateOne({_id:id},{isVerified:true})
          await UserOtpStore.deleteMany({userId:id})

          // Redirect to success page or login page after verification
          req.flash("success", "your account is created ");
          res.redirect("/login");
        } else {
          
          req.flash("fail", "invalid otp");
          res.redirect(`/otp?id=${id}`);
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};





// resend otp
const resendOtp = async (req, res) => {
  try {
    const id=req.query.id
    const userOtp = await UserOtpStore.findOne({ userId:id });

    if (!userOtp) {
      req.flash("fail", "User not found");
      return res.redirect("/signup");
    }

    // Generate new OTP and update expiry time
    const newOtp = crypto.randomInt(100000, 999999).toString();
    

    userOtp.otp = newOtp;
    userOtp.otpexpire = Date.now() + 300000;
    await userOtp.save();

    // Send new OTP to user's email
    await transporter.sendMail({
      from: "testbrocamp@gmail.com",
      to: user.email,
      subject: "Resend OTP",
      text: `Your new OTP is ${newOtp}`,
    });
    
    res.redirect(`/otp?id=${id}`);
  } catch (error) {
    console.log(error.message);
  }
};

//-------------------------------------------------------  END  -----------------------------------------------------------
//---------------------------------------------------  LOGOUT  ----------------------------------------------------------------------

const logout= async (req,res)=>{
  try {
    req.session.destroy()
  res.redirect('/login')
  } catch (error) {
    console.log(error.message);
  }
}

//--------------------------------------------------------------------  END  -----------------------------------------------------------
//-------------------------------------------------  FORGOT PASSWORD  ----------------------------------------------------------------------------


//  get email check page
const getforgotPassword=async(req,res)=>{

  try {
    if (req.session.user){
      res.redirect('/home')
    }else{
    const fail=req.flash('fail')
    res.render('forgotPassword',{fail})
  }
  } catch (error) {
    console.log(error.message);
  }
}


//  post email check page
const postforgotPassword=async(req,res)=>{
  try {
    
      const user=await User.findOne({email:req.body.email})
      if(!user || user.isVerified == false){
        req.flash('fail','you dont have an account,please signup')
        res.redirect('/login')
      }else{
        
        const email=req.body.email
        const existUser = await User.findOne({ email: req.body.email });
        const otp1 = crypto.randomInt(100000, 999999).toString(); //generate random otp

        const storeOtp=await new UserOtpStore({
              userId:existUser._id,
              otp:otp1,
              otpexpire:Date.now()+300000
        })
        await storeOtp.save()

          //send OTP to user's email
          await transporter.sendMail({
            from: "testbrocamp@gmail.com",
            to: req.body.email,
            subject: "Secure Your Account with This Code",
            text: `your OTP for reset  password ${otp1}`,
          });
        
          
          res.redirect(`/otpcheck?email=${email}`);

      }
    
  } catch (error) {
    console.log(error.message);
  }

}


// get otp check page
const getotpcheck=async (req,res)=>{
  try {

      if(req.session.user){
        res.redirect('/home')
      }else{


    const email=req.query.email
    if(email){

    res.render('forgotpassOTP',{email:email})
  }else{
    res.redirect('/login')
  }}

  } catch (error) {
    console.log(error.message);
  }
}

//post otp checkpage
const postotpcheck=async (req,res)=>{
  
  
  
  try {
    const email=req.body.email
    // console.log(email);
    
    const user = await User.findOne({ email:email });
    // console.log(user);
    
    const userid=user._id
    const userOtp=await UserOtpStore.findOne({userId:userid})
    // console.log(userOtp);
    


    if(userOtp.otpexpire < new Date()){   
      req.flash('fail','otpexpired')
      res.redirect('/forgotemail')
     
      
    }else{
      if(userOtp.otp == req.body.otp){
        
        await UserOtpStore.deleteMany({userId:userid})
        res.redirect(`/setpassword?email=${email}`)
      }else{
        await UserOtpStore.deleteMany({userId:userid})
        req.flash('fail','otp not correct start again')
        res.redirect(`/forgotemail`)
      }
    }
  
  } catch (error) {
    console.log(error.message);
  }
}


// get set password page
const getSetPassword=async (req,res)=>{
  try {

    if (req.session.user){
      res.redirect('/home')
    }else{

    const email=req.query.email
    if(email){
      const fail=req.flash('fail')
    res.render('setpassword',{fail,email})
  }else{
    res.redirect('/login')
  }
  }
  } catch (error) {
    console.log(error.message);
  }
}

//post set password
const postSetPassword=async (req,res)=>{
  
  try {
    const email=req.body.email
    if(req.body.password == req.body.conformpassword){
  
      const password=req.body.password
      const user=await User.findOne({email:email})
      
      const hasedpassword = await bcrypt.hash(password, 10); //hash password
      user.password=hasedpassword
    
      await user.save()
     
      req.flash('success','password changed ')
      res.redirect('/login')



    }else{
      req.flash('fail','password and conform Passwords are not correct')
      
      res.redirect(`/setpassword?email=${email}`)
    }

  } catch (error) {
    console.log(error.message);
  }
}

//-------------------------------------------------------  END  -----------------------------------------------------------

//------------------------------------------------- HOME PAGE --------------------------------------------------------

//load home
const loadHome = async (req, res) => {
  
  try {
    const user=req.session.user  
    const userData=await User.findOne({email:user})
    if(userData.isBlocked){
      req.session.destroy()
      res.redirect('/login')

    }else{

    const product = await Product.find({ isBlocked: true }).populate('brandName')
   const category=await Category.find({isListed:true})
   const brand=await Brand.find({isListed:true})
    res.render("home",{product:product,category:category,brand:brand});
}
  } catch (error) {
    console.log(error.message);
  }
};

//-------------------------------------------------------  END  -----------------------------------------------------------

//------------------------------------------- PRODUCT DETAILS -----------------------------------------------------------------

//load product details page
const productDetails=async (req,res)=>{

  try {
    const id=req.query.id;
    const productData=await Product.findOne({_id:id}).populate('brandName').populate('category')
    const category=await Category.find({isListed:true})
    const brand=await Brand.find({isListed:true})
 
    if(productData){
      res.render('productDetails',{data:productData,brand:brand,category:category})
    }else{
      res.redirect('/home')
    }
    
  } catch (error) {
    console.log(error.message);
  }
}

//----------------------------------------------------  END  -----------------------------------------------------------



module.exports = {
  loadLogin,
  loadSignup,
  otpVarification,
  getforgotPassword,
  postforgotPassword,
  postotpcheck,
  getotpcheck,
  getSetPassword,
  postSetPassword,
  insertUser,
  otpVarificationCheck,
  resendOtp,
  verifyUser,
  loadHome,
  productDetails,
  logout
};
