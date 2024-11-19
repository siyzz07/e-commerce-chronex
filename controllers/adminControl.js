const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const Category = require("../models/category");
const Brand = require("../models/brand");
const Product = require("../models/porduct");
const Admin = require("../models/adminModel");
const Order = require("../models/orders");
const moment = require("moment");

const email = "admin@gmail.com";
// const password = "12345";

//-------------------------------------------------- LOGIN --------------------------------------------------------------

// load admin login page
const loadAdminLogin = async (req, res) => {
  try {
    if (!req.session.admin) {
      const fail = req.flash("fail");
      res.render("login", { fail });
    } else {
      res.redirect("/admin/dashboard");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//veify the admin from the login
const adminVerify = async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: email });

    if (admin.email == req.body.email) {
      if (req.body.password == admin.password) {
        req.session.admin = admin.email;
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
const logoutAdmin = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error.message);
  }
};

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

    // total delivered
    const delivered = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, totaldeleverd: { $sum: 1 } } },
    ]);

    let totaldeleverd = delivered.length > 0 ? delivered[0].totaldeleverd : 0;

    //  total Shippen
    const shipped = await Order.aggregate([
      { $match: { status: "Shipped" } },
      { $group: { _id: null, totalshipped: { $sum: 1 } } },
    ]);

    let totalshipped = shipped.length > 0 ? shipped[0].totalshipped : 0;

    // total candelled
    const cancelled = await Order.aggregate([
      { $match: { status: "Cancelled" } },
      { $group: { _id: null, totalcancelled: { $sum: 1 } } },
    ]);

    let totalcancelled = cancelled.length > 0 ? cancelled[0].totalcancelled : 0;

    // total returnen52
    const returned = await Order.aggregate([
      { $match: { status: "Returned" } },
      { $group: { _id: null, totalreturned: { $sum: 1 } } },
    ]);

    let totalreturned = returned.length > 0 ? returned[0].totalreturned : 0;

    // best selling product
    const bestSellingProducts = await Order.aggregate([
      { $match: { status: { $nin: ["Cancelled", "Returned"] } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo._id",
          title: { $first: "$productInfo.title" },
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    let topProducts = bestSellingProducts.length > 0 ? bestSellingProducts : [];

    // top selling categories
    const topSellingCategories = await Order.aggregate([
      { $match: { status: { $nin: ["Cancelled", "Returned"] } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      {
        $lookup: {
          from: "catetgories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $project: {
          categoryId: "$_id",
          categoryName: "$categoryInfo.category",
          totalSold: 1,
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    let topCategories =
      topSellingCategories.length > 0 ? topSellingCategories : [];

    //top selling brand
    const topSellingBrands = await Order.aggregate([
      { $match: { status: { $nin: ["Cancelled", "Returned"] } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.brandName",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "_id",
          foreignField: "_id",
          as: "brandInfo",
        },
      },
      { $unwind: "$brandInfo" },
      {
        $project: {
          brandId: "$_id",
          brandName: "$brandInfo.brand",
          totalSold: 1,
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    let topBrands = topSellingBrands.length > 0 ? topSellingBrands : [];

    // --------------- chart ----------------

    //  week wise chart
    const startOfWeek = moment().startOf("isoWeek").toDate();
    const endOfWeek = moment().endOf("isoWeek").toDate();

    // Weekly sales aggregation
    const weeklySales = await Order.aggregate([
      {
        $match: {
          status: { $nin: ["Cancelled", "Returned"] },
          orderDate: { $gte: startOfWeek, $lte: endOfWeek },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
          totalSales: { $sum: "$totalWithDiscount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const allDaysOfWeek = [];
    for (let i = 0; i < 7; i++) {
      const day = moment(startOfWeek).add(i, "days");
      allDaysOfWeek.push({
        day: day.format("dddd"),
        totalSales: 0,
        totalOrders: 0,
      });
    }

    weeklySales.forEach((sale) => {
      const dateIndex = allDaysOfWeek.findIndex(
        (day) => day.day === moment(sale._id).format("dddd")
      );
      if (dateIndex !== -1) {
        allDaysOfWeek[dateIndex].totalSales = sale.totalSales;
        allDaysOfWeek[dateIndex].totalOrders = sale.totalOrders;
      }
    });


    // year wise chart
    const currentYear = moment().year();
    const monthlySales = await Order.aggregate([
      {
        $match: {
          status: { $nin: ["Cancelled", "Returned"] },
          orderDate: {
            $gte: moment().startOf("year").toDate(),
            $lte: moment().endOf("year").toDate(),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$orderDate" },
          },
          totalSales: { $sum: "$totalWithDiscount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    const monthlySalesData = Array.from({ length: 12 }, (_, index) => ({
      month: moment().month(index).format("MMMM"),
      year: currentYear,
      totalSales: 0,
      totalOrders: 0,
    }));

    monthlySales.forEach((sale) => {
      const monthIndex = sale._id.month - 1;
      monthlySalesData[monthIndex].totalSales = sale.totalSales;
      monthlySalesData[monthIndex].totalOrders = sale.totalOrders;
    });

    const weeklyreport = allDaysOfWeek.map((day) => day.totalSales);
    const dailyreport = allDaysOfWeek.map((day) => day.day);



    const monthlyreport = monthlySalesData.map((val) => val.totalSales);
    const months = monthlySalesData.map((val) => val.month);

    res.render("home", {
      totalRevenue,
      totalOrders,
      productsCount,
      totalDiscount,
      totaldeleverd,
      totalshipped,
      totalcancelled,
      totalreturned,
      topProducts,
      topCategories,
      topBrands,
      // --chart--
      weeklyreport,
      dailyreport,
      monthlyreport,
      months,
    });
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
    const unblock = await User.findByIdAndUpdate(id, { isBlocked: false }); ////
    res.redirect("/admin/userdata");
  } catch (error) {
    console.log(error.message);
  }
};

//----------------- block user -----------------------
const blockuser = async (req, res) => {
  try {
    const id = req.query.id;

    const block = await User.findByIdAndUpdate(id, { isBlocked: true }); ///
    // console.log(block);

    res.redirect("/admin/userdata");
  } catch (error) {
    console.log(error.message);
  }
};

//------------------------------------------------------ END ------------------------------------------------------------------
//------------------------------------ SALES REPORT -------------------------------------------------------------------

//load sales report page
const salesReportGet = async (req, res) => {
  try {
    // total amount
    const total = await Order.aggregate([
      { $match: { status: { $nin: ["Cancelled", "Returned"] } } },
      { $group: { _id: null, totalAmount: { $sum: "$totalPrice" } } },
    ]);
    let totalAmount = total.length > 0 ? total[0].totalAmount : 0;

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
      { $count: "canceledCount" },
    ]);
    const canceledOrderCount =
      canceledOrderCountResult.length > 0
        ? canceledOrderCountResult[0].canceledCount
        : 0;

    // returned order
    const retrunedOrderCountResult = await Order.aggregate([
      { $match: { status: "Returned" } },
      { $count: "returnedCount" },
    ]);
    const returnedOrderCount =
      retrunedOrderCountResult.length > 0
        ? retrunedOrderCountResult[0].returnedCount
        : 0;

    const { reportType, startDate, endDate } = req.query;

    // Define date filters based on reportType
    let dateFilter = {};
    const today = new Date();

    if (reportType === "Today") {
      dateFilter = {
        orderDate: {
          $gte: moment(today).startOf("day").toDate(),
          $lte: today,
        },
      };
    } else if (reportType === "Weekly") {
      dateFilter = {
        orderDate: {
          $gte: moment(today).startOf("week").toDate(),
          $lte: today,
        },
      };
    } else if (reportType === "Monthly") {
      dateFilter = {
        orderDate: {
          $gte: moment(today).startOf("month").toDate(),
          $lte: today,
        },
      };
    } else if (reportType === "Yearly") {
      dateFilter = {
        orderDate: {
          $gte: moment(today).startOf("year").toDate(),
          $lte: today,
        },
      };
    } else if (reportType === "custom" && startDate && endDate) {
      dateFilter = {
        orderDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    const report = await Order.find({
      ...dateFilter,
      status: { $nin: ["Cancelled", "Returned"] },
    })
      .populate("userId")
      .sort({ orderDate: -1 });

    // find total price in filterd salse reprt
    const totalPrice = report.reduce((acc, val) => {
      return val.totalPrice + acc;
    }, 0);

    // total discount given in filtered rijport
    const totalDiscountGiven = report.reduce(
      (acc, val) => val.discount + acc,
      0
    );

    // total discountreduced amount    in filtered report
    const amountAfterDiscount = report.reduce(
      (acc, val) => val.totalWithDiscount + acc,
      0
    );

    res.render("salesReport", {
      totalAmount,
      totalRevenue,
      totalOrders,
      productsCount,
      totalDiscount,
      canceledOrderCount,
      report,
      reportType,
      returnedOrderCount,
      totalPrice,
      totalDiscountGiven,
      amountAfterDiscount,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//------------------------------------------------------ END ------------------------------------------------------------------

const chart = async (req, res) => {
  res.render("chart");
};

module.exports = {
  loadAdminLogin,
  adminVerify,
  dashboard,
  userData,
  deleteUser,
  unblockuser,
  blockuser,
  logoutAdmin,
  salesReportGet,
  chart,
};
