const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const Category = require("../models/category");
const Brand=require('../models/brand')
const Product=require("../models/porduct")
const Admin=require('../models/adminModel')
const Order=require('../models/orders')
const moment = require('moment');

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
    // total revenue
    const revenue = await Order.aggregate([
      { $match: { status: { $nin: ["Cancelled", "Returned"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalWithDiscount" } } },
    ]);

    let totalRevenue = revenue.length > 0 ? revenue[0].totalRevenue : 0;

    // total orders
    const orders = await Order.aggregate([
      { $match: { status: { $nin: ["Cancelled", "Returned"] } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    let totalOrders = orders.length > 0 ? orders[0].count : 0;

    const productsCount = await Product.countDocuments();

        //  total discount amount
        const discount = await Order.aggregate([
          { $match: { status: { $nin: ["Cancelled", "Returned"] } } },
          { $group: { _id: null, totalDiscount: { $sum: "$discount" } } },
        ]);
        
        let totalDiscount = discount.length > 0 ? discount[0].totalDiscount : 0;

    res.render("home", { totalRevenue, totalOrders,productsCount,totalDiscount });
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


//----------- delete user form the userlist page after clicing the delet button ------------
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


// ------------------- unblock user ------------------
const unblockuser = async (req, res) => {
  try {
    const id = req.query.id;
    const unblock = await User.findByIdAndUpdate(id, { isBlocked: false });////
    res.redirect("/admin/userdata");
  } catch (error) {
    console.log(error.message);
  }
};


//----------------- block user -----------------------
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
//------------------------------------ SALES REPORT -------------------------------------------------------------------


//load sales report page
const salesReportGet=async (req,res)=>{
 
  try{


    // total amount
    const total=await Order.aggregate([
      {$match:{status:{$nin:['Cancelled','Returned']}}},
      {$group: {_id:null ,totalAmount:{$sum:"$totalPrice"}}}
    ])
    let totalAmount=total.length>0 ?total[0].totalAmount:0

    // total revenue
    const revenue = await Order.aggregate([
      { $match: { status: { $nin: ["Cancelled", "Returned"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalWithDiscount" } } },
    ]);

    let totalRevenue = revenue.length > 0 ? revenue[0].totalRevenue : 0;

    // total orders
    const orders = await Order.aggregate([
      { $match: { status: { $nin: ["Cancelled", "Returned"] } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    let totalOrders = orders.length > 0 ? orders[0].count : 0;

    const productsCount = await Product.countDocuments();

        //  total discount amount
        const discount = await Order.aggregate([
          { $match: { status: { $nin: ["Cancelled", "Returned"] } } },
          { $group: { _id: null, totalDiscount: { $sum: "$discount" } } },
        ]);
        
        let totalDiscount = discount.length > 0 ? discount[0].totalDiscount : 0;
      
        //cancelled orders
        const canceledOrderCountResult = await Order.aggregate([
          { $match: { status: "Cancelled" } },
          { $count: "canceledCount" }
        ]);
        const canceledOrderCount = canceledOrderCountResult.length > 0 ? canceledOrderCountResult[0].canceledCount : 0;

        // returned order 
    
        const retrunedOrderCountResult = await Order.aggregate([
          { $match: { status: "Returned" } },
          { $count: "returnedCount" }
        ]);
        const returnedOrderCount = retrunedOrderCountResult.length > 0 ? retrunedOrderCountResult[0].returnedCount : 0;



        const { reportType, startDate, endDate } = req.query;
   
    

        // Define date filters based on reportType
        let dateFilter = {};
        const today = new Date();
    
        if (reportType === 'Weekly') {
            dateFilter = { 
                orderDate: { 
                    $gte: moment(today).startOf('week').toDate(),
                    $lte: today
                } 
            };
        } else if (reportType === 'Monthly') {
            dateFilter = {
                orderDate: {
                    $gte: moment(today).startOf('month').toDate(),
                    $lte: today
                }
            };
        } else if (reportType === 'Yearly') {
            dateFilter = {
                orderDate: {
                    $gte: moment(today).startOf('year').toDate(),
                    $lte: today
                }
            };
        } else if (reportType === 'custom' && startDate && endDate) {
            dateFilter = {
                orderDate: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }
    
        const report = await Order.find({ 
            ...dateFilter, 
            status: { $nin: ["Cancelled", "Returned"] } 
        }).populate('userId');
    
        res.render("salesReport", {
            totalAmount,
            totalRevenue,
            totalOrders,
            productsCount,
            totalDiscount,
            canceledOrderCount,
            report,
            reportType,
            returnedOrderCount
        });
  

  }catch(error){
    console.log(error.message);
    
  }
}

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
  salesReportGet
};
