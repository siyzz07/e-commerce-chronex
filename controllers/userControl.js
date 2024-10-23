const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const moment = require("moment");
const { log } = require("console");
const Product = require("../models/porduct");
const Category = require("../models/category");
const Brand = require("../models/brand");
const UserOtpStore = require("../models/userOtpVerification");
const Cart=require('../models/cart')
const Wishlist=require('../models/wishlist')
const Passport = require("passport"); //google auth
const googleStrategy = require("passport-google-oauth20").Strategy; //google auth
const razorpayInstance=require('../config/razorpayConfig')//rezorpay
const Coupen=require('../models/coupen')

//-------------------------------------------------- LOGIN PAGE --------------------------------------------------------------------------

//  for load login page
const loadLogin = async (req, res) => {
  try {
    if (req.session.user) {
      res.redirect("/home");
    } else {
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
    const email = req.body.email;

    if (user && user.isVerified == true) {
      if (user.isBlocked == false) {
        if (user.password) {
          const matchPassword = await bcrypt.compare(
            req.body.password,
            user.password
          );
          if (matchPassword) {
            req.session.user = { email: user.email, _id: user._id };
            res.redirect("/home");
          } else {
            req.flash("fail", "invalied password");
            res.redirect("/login");
          }
        } else {
          req.flash("fail", "use to login with google");
          res.redirect("/login");
        }
      } else {
        req.flash("fail", "Your account blocked by admin");
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
    if (req.session.user) {
      res.redirect("/home");
    } else {
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
    if (existUser && existUser.isVerified == true) {
      req.flash("fail", "user already exist");
      res.redirect("/signup");
    } else {
      if (existUser && existUser.isVerified == false) {
        ////////////////
        await User.findByIdAndDelete(existUser._id); ////////////////
      }
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
        const userDataId = userData._id;

        const storeOtp = await new UserOtpStore({
          userId: userDataId,
          otp: otp,
          otpexpire: Date.now() + 300000,
        });
        await storeOtp.save();

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
    if (req.session.user) {
      res.redirect("/home");
    } else {
      const id = req.query.id;
      if (id) {
        const fail = req.flash("fail");
        res.render("OTPverification", { fail, id });
      } else {
        res.redirect("/signup");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//in otp vatification page chek the two otp's are same or not
const otpVarificationCheck = async (req, res) => {
  try {
    const id = req.body.id;
    // console.log(id);

    const user = await User.findOne({ _id: id });
    const userOtp = await UserOtpStore.findOne({ userId: id });

    if (!user) {
      req.flash("fail", "fill the signup detials");
      res.redirect("/signup");
    } else {
      if (userOtp.otpexpire < new Date()) {
        req.flash("fail", "otp expired");
        res.redirect(`/otp?id=${id}`);
      } else {
        if (userOtp.otp == req.body.userotp) {
          // Mark the user as verified if OTP is correct and not expired && delete the otp form the the otp store database
          await User.updateOne({ _id: id }, { isVerified: true });
          await UserOtpStore.deleteMany({ userId: id });

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
    const id = req.query.id;
    const userOtp = await UserOtpStore.findOne({ userId: id });
    const user = await User.findOne({ _id: id });
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

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

//--------------------------------------------------------------------  END  -----------------------------------------------------------
//-------------------------------------------------  FORGOT PASSWORD  ----------------------------------------------------------------------------

//  get email check page
const getforgotPassword = async (req, res) => {
  try {
    if (req.session.user) {
      res.redirect("/home");
    } else {
      const fail = req.flash("fail");
      res.render("forgotPassword", { fail });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//  post email check page
const postforgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || user.isVerified == false) {
      req.flash("fail", "you dont have an account,please signup");
      res.redirect("/login");
    } else {
      const email = req.body.email;
      const existUser = await User.findOne({ email: req.body.email });
      const otp1 = crypto.randomInt(100000, 999999).toString(); //generate random otp

      const storeOtp = await new UserOtpStore({
        userId: existUser._id,
        otp: otp1,
        otpexpire: Date.now() + 300000,
      });
      await storeOtp.save();

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
};

// get otp check page
const getotpcheck = async (req, res) => {
  try {
    if (req.session.user) {
      res.redirect("/home");
    } else {
      const email = req.query.email;
      if (email) {
        res.render("forgotpassOTP", { email: email });
      } else {
        res.redirect("/login");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//post otp checkpage
const postotpcheck = async (req, res) => {
  try {
    const email = req.body.email;
    // console.log(email);

    const user = await User.findOne({ email: email });
    // console.log(user);

    const userid = user._id;
    const userOtp = await UserOtpStore.findOne({ userId: userid });
    // console.log(userOtp);

    if (userOtp.otpexpire < new Date()) {
      await UserOtpStore.deleteMany({ userId: userid });
      req.flash("fail", "otpexpired");
      res.redirect("/forgotemail");
    } else {
      if (userOtp.otp == req.body.otp) {
        await UserOtpStore.deleteMany({ userId: userid });
        res.redirect(`/setpassword?email=${email}`);
      } else {
        await UserOtpStore.deleteMany({ userId: userid });
        req.flash("fail", "otp not correct start again");
        res.redirect(`/forgotemail`);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// get set password page
const getSetPassword = async (req, res) => {
  try {
    if (req.session.user) {
      res.redirect("/home");
    } else {
      const email = req.query.email;
      if (email) {
        const fail = req.flash("fail");
        res.render("setpassword", { fail, email });
      } else {
        res.redirect("/login");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//post set password
const postSetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    if (req.body.password == req.body.conformpassword) {
      const password = req.body.password;
      const user = await User.findOne({ email: email });

      const hasedpassword = await bcrypt.hash(password, 10); //hash password
      user.password = hasedpassword;

      await user.save();

      req.flash("success", "password changed ");
      res.redirect("/login");
    } else {
      req.flash("fail", "password and conform Passwords are not correct");

      res.redirect(`/setpassword?email=${email}`);
    }
  } catch (error) {
    console.log(error.message);
  }
};

//-------------------------------------------------------  END  -----------------------------------------------------------

//------------------------------------------------- HOME PAGE --------------------------------------------------------

//load home
const loadHome = async (req, res) => {
  try {
    const user = req.session.user.email;
    const userId=req.session.user._id;
   
    const userData = await User.findOne({ email: user });
    if (userData.isBlocked) {
      req.session.destroy();
      res.redirect("/login");
    } else {

      const cart=await Cart.findOne({userId:userId})

      const wishlist=await Wishlist.findOne({userId:userId})
      const product = await Product.find({ isBlocked: true })
        .populate("brandName")
        .populate("category");
      const category = await Category.find({ isListed: true });
      const brand = await Brand.find({ isListed: true });
      res.render("home", {
        product: product,
        category: category,
        brand: brand,
        cart,
        wishlist,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//-------------------------------------------------------  END  -----------------------------------------------------------

//------------------------------------------- PRODUCT DETAILS -----------------------------------------------------------------

//load product details page
const productDetails = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findOne({ _id: id })
      .populate("brandName")
      .populate("category");
    const category = await Category.find({ isListed: true });
    const brand = await Brand.find({ isListed: true });

    if (productData) {
      const msg = req.flash("msg");
      const fail = req.flash("fail");
      res.render("productDetails", {
        data: productData,
        brand: brand,
        category: category,
        msg,
        fail,
      });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//----------------------------------------------------  END  -----------------------------------------------------------

//----------------------------------------------  USER ACCOUNT --------------------------------------------------------

//user accoutprofile page get

const account = async (req, res) => {
  try {
    const email = req.session.user.email;

    const user = await User.findOne({ email: email });

    const category = await Category.find({ isListed: true });
    const brand = await Brand.find({ isListed: true });

    const msg = req.flash("msg");
    res.render("account", {
      category: category,
      brand: brand,
      user: user,
      msg,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//edit the user data
const postEditUser = async (req, res) => {
  try {
    let id = req.body.id;
    // console.log("ewewe"+id);

    const user = await User.findOne({ _id: id });
    // console.log(user);

    if (user) {
      const update = await User.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
          },
        }
      );

      if (update) {
        req.flash("msg", "updated successfully");
        res.redirect("/userAccount");
      }
    } else {
      res.redirect("/userAccount");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// get change password page
const getChangePassword = async (req, res) => {
  try {
    const id = req.query.id;
    if (id) {
      const user = await User.findOne({ _id: id });
      const category = await Category.find({ isListed: true });
      const brand = await Brand.find({ isListed: true });

      const fail = req.flash("fail");

      res.render("changePassword", {
        category: category,
        brand: brand,
        user: user,
        fail,
      });
    } else {
      res.redirect("/userAccount");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//post change password
const postChangePassword = async (req, res) => {
  try {
    const id = req.body.id;
    const user = await User.findOne({ _id: id });
    const matchPassword = await bcrypt.compare(req.body.oldpass, user.password);
    if (matchPassword) {
      if (req.body.newpass == req.body.confirmpass) {
        const password = req.body.newpass;
        const hasedpassword = await bcrypt.hash(password, 10);
        user.password = hasedpassword;

        await user.save();
        req.flash("msg", "Password Changed");
        res.redirect("/userAccount");
      }
    } else {
      req.flash("fail", "Current Password is Wrong ");
      res.redirect(`/changePassword?id=${id}`);
    }
  } catch (error) {
    console.log(error.message);
  }
};

//----------------------------------------------------  END  -----------------------------------------------------------
//----------------------------------------------- SHOP ---------------------------------------------------------------

const getShop = async (req, res) => {
  try {
    // short code form the shop page
    const sortOption = req.query.sort;
    let sortmethod = {};
    let selected;
    switch (sortOption) {
      case "priceinc":
        sortmethod = { price: 1 };
        selected = "Price: Low to High";
        break;
      case "pricedec":
        sortmethod = { price: -1 };
        selected = "Price: High to Low";
        break;
      case "nameinc":
        sortmethod = { title: 1 };
        selected = "Name :A to Z";
        break;
      case "namedec":
        sortmethod = { title: -1 };
        selected = "Name :z to A";
        break;
      default:
        sortmethod = {};
        selected = "Featured";
    }

    const user = req.session.user.email;
    const userData = await User.findOne({ email: user });
    if (userData.isBlocked) {
      req.session.destroy();
      res.redirect("/login");
    } else {
      const product = await Product.find({ isBlocked: true })
        .populate("brandName")
        .populate("category")
        .sort(sortmethod);

      const category = await Category.find({ isListed: true });
      const brand = await Brand.find({ isListed: true });

      res.render("shop", {
        product: product,
        category: category,
        brand: brand,
        selected,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
// ------------------------------------- GOOGLE AUTH ----------------------------------

// This handles redirection after successful Google authentication
googleAuth = (req, res) => {
  try{

    if (req.user) {
      const useremail = req.user.email;
      req.session.user = { email: req.user.email, _id: req.user._id };
  
      return res.redirect("/home");
    } else {
      return res.redirect("/login");
    }


  }catch(error){
    console.log(error.message);
    
  }
 
};

// ------------------------------------- END ----------------------------------

// ------------------------------------ RAZORPAY ----------------------------------------------


const createOrder = async (req, res) => {

  
  const options = {
    amount: req.body.amount * 100, // Convert to paisa
    currency: "INR",
    receipt: "order_rcptid_11"
  };

  try {

    const order = await razorpayInstance.orders.create(options);
  
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error); // Log any errors
    res.status(500).send({ error: 'Failed to create Razorpay order' });
  }
};


const verifyPayment = async (req, res) => {


  const { razorpay_payment_id } = req.body;

  try {
     
      const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);

      if (payment.status === 'captured') {

        console.log("sddsffsdfsdfdsfdsddsfsdfsdfsffa",req.body);
               
      const  userId=req.session.user._id

      const { payment_option, address, couponName } = req.body;
       const coupenAddUser = await Coupen.updateOne(
        { coupenCode: couponName }, 
        {
            $push: { usedBy: userId },  
            $inc: { usedCount: 1 }      
        }
    );
    

       const user =await User.findOne({_id:userId})
       const shippingAddress=await Address.findOne({"addressData._id":address},{ "addressData.$": 1 } )

       const cartItems = await Cart.findOne({userId:userId})
        const order =new Order({
            userId:userId,
            items:cartItems.items.map((item)=>({
                product:item.product._id,
                price:item.price,
                quantity:item.quantity

            })),
            totalPrice:cartItems.totalPrice,
            billingDetails:{
                name:user.name,
                email: user.email,
                phno: user.phone,
                address:shippingAddress.addressData[0].address,
                secPnoe: shippingAddress.addressData[0].secphone,
                pincode: shippingAddress.addressData[0].pincode,
                country: shippingAddress.addressData[0].country,
                state: shippingAddress.addressData[0].state,
                city: shippingAddress.addressData[0].city,
              },
              discount:cartItems.discount,
              totalWithDiscount:cartItems.totalWithDiscount,
              paymentMethod:payment_option,
              paymentStatus:'pending',
              status:'Pending'
        
            });

            await order.save()
            
            console.log(order,"sddsfsdfsafsdfdsfdsfwwwwwwwwwwwwwwwwwwwwwwwwwwwwww");
            
            
            for(let item of cartItems.items){
                await Product.findByIdAndUpdate(item.product._id,{
                    $inc:{stock:-item.quantity}
                })
            }





          res.json({ success: true, redirectUrl: '/payment/success' }); // Redirect to success page
      } else {
          res.json({ success: false, redirectUrl: '/payment/fail' }); // Redirect to failure page
      }
  } catch (error) {
      console.error("Error fetching payment details:", error);
      res.status(500).send({ error: 'Failed to verify payment' });
  }
};


// --------------------------------------------- END ----------------------------------

// offfffffffffffffffffffffffffffffffffffffffffffer



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
  logout,
  account,
  postEditUser,
  getChangePassword,
  postChangePassword,
  getShop,
  googleAuth,
  /////////////////

};
