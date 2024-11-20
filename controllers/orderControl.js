const Order = require("../models/orders");
const Cart = require("../models/cart");
const Category = require("../models/category");
const Brand = require("../models/brand");
const Product = require("../models/porduct");
const Address = require("../models/address");
const { use } = require("bcrypt/promises");
const User = require("../models/userModels");
const Coupen = require("../models/coupen");
const googleStrategy = require("passport-google-oauth20").Strategy; //google auth
const razorpayInstance = require("../config/razorpayConfig"); //rezorpay
const Transaction = require("../models/transaction");
const Wallet = require("../models/wallet");
const Wishlist = require("../models/wishlist");
// ------------------------------------ IN USER SIDE ----------------------------------------------

// load checkoup page  from user side
const getCheckOut = async (req, res) => {
  try {
    const userId = req.session.user._id;

    const cartProduct = await Cart.findOne({ userId: userId }).populate(
      "items.product"
    );
    const total = cartProduct.totalPrice;
    const totalPrice = cartProduct.totalPrice;
    let addedCoupen;
    if (req.query.coupenName) {
      addedCoupen = req.query.coupenName;
    }

    const today = new Date();
    const coupen = await Coupen.find({
      minAmountPurchase: { $lte: totalPrice },
      usedBy: { $nin: [userId] },
      coupenCode: { $ne: addedCoupen },
      expiryDate: { $gte: today },
    });

    const msg = req.flash("msg");
    const fail = req.flash("fail");

    if (!req.query.coupenName) {
      const coupenInCart = await Cart.updateOne(
        { userId: userId },
        { $set: { discount: 0, totalWithDiscount: total } }
      );
    }

    if (cartProduct) {
      if (cartProduct.items.length !== 0) {
        if (cartProduct.totalPrice != 0) {
          const category = await Category.find({ isListed: true });
          const brand = await Brand.find({ isListed: true });
          const address = await Address.findOne({ userId: userId });

          let coupenName;
          if (req.query.coupenName) {
            coupenName = req.query.coupenName;
          }
          const razKey = process.env.RAZORPAY_KEY_ID;

          res.render("checkOut", {
            category: category,
            brand: brand,
            cart: cartProduct,
            address: address || { addressData: [] },
            userId,
            coupen,
            coupenName,
            msg,
            fail,
            razKey,
          });
        } else {
          req.flash("fail", "update cart");
          res.redirect("/cart");
        }
      } else {
        req.flash("fail", "Your Cart is Empty");
        res.redirect("/cart");
      }
    } else {
      req.flash("fail", "Your Cart is Empty");
      res.redirect("/cart");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// place the order from the check out page
const placeOrder = async (req, res) => {
  try {
    const userId = req.session.user._id;
    // const cart = await Cart.findOne({ userId: userId });
    // const wishlist = await Wishlist.findOne({ userId: userId });

    const { payment_option, address, couponName } = req.body;
    const coupenAddUser = await Coupen.updateOne(
      { coupenCode: couponName },
      {
        $push: { usedBy: userId },
        $inc: { usedCount: 1 },
      }
    );

    const user = await User.findOne({ _id: userId });
    const shippingAddress = await Address.findOne(
      { "addressData._id": address },
      { "addressData.$": 1 }
    );

    const cartItems = await Cart.findOne({ userId: userId });
    const order = new Order({
      userId: userId,
      items: cartItems.items.map((item) => ({
        product: item.product._id,
        price: item.price,
        quantity: item.quantity,
      })),
      totalPrice: cartItems.totalPrice,
      billingDetails: {
        name: user.name,
        email: user.email,
        phno: user.phone,
        address: shippingAddress.addressData[0].address,
        secPnoe: shippingAddress.addressData[0].secphone,
        pincode: shippingAddress.addressData[0].pincode,
        country: shippingAddress.addressData[0].country,
        state: shippingAddress.addressData[0].state,
        city: shippingAddress.addressData[0].city,
      },
      discount: cartItems.discount,
      totalWithDiscount: cartItems.totalWithDiscount,
      paymentMethod: payment_option,
      paymentStatus: "pending",
      status: "Pending",
    });

    await order.save();

    for (let item of cartItems.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    await Cart.findOneAndDelete({ userId });
    res.json({
      success: true,
      redirectUrl: `/confirmorder?orderId=${order._id}`,
    });
  } catch (error) {
    console.log(error.messagea);
  }
};

// get confirmorder page
const confirmOrder = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    if (orderId) {
      const orderData = await Order.findOne({ _id: orderId }).populate(
        "userId"
      );
      res.render("confirmOrder", { order: orderData });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// order history
const getOrderHistory = async (req, res) => {
  try {
    const id = req.session.user._id;
    const userId = req.session.user._id;
    const cart = await Cart.findOne({ userId: userId });
    const wishlist = await Wishlist.findOne({ userId: userId });

    if (!id) {
      return res.redirect("/home");
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 5;

    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments({ userId: id });

    const orders = await Order.find({ userId: id })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalOrders / limit);

    const category = await Category.find({ isListed: true });
    const brand = await Brand.find({ isListed: true });

    const fail = req.flash("fail");
    res.render("orderHistory", {
      category: category,
      brand: brand,
      orders: orders,
      currentPage: page,
      totalPages: totalPages,
      fail,
      cart,
      wishlist,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// user can see the order details  ,from history page
const getOrderDeatails = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const orderId = req.query.orderid;
    const users = req.query.userId;

    if (!orderId || userId !== users) {
      return res.redirect("/order");
    }

    const cart = await Cart.findOne({ userId: userId });
    const wishlist = await Wishlist.findOne({ userId: userId });

    const orderData = await Order.findOne({ _id: orderId }).populate({
      path: "items.product",
      model: "Product",
    });

    const user = await User.findOne({ _id: req.session.user._id });
    const category = await Category.find({ isListed: true });
    const brand = await Brand.find({ isListed: true });
    res.render("ordreDetails", {
      category: category,
      brand: brand,
      order: orderData,
      user: user,
      cart,
      wishlist,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// cancel order
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.query.orderid;
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).send("Order not found");
    }

    const userId = order.userId;

    if (order.paymentMethod === "Razorpay") {
      let wallet = await Wallet.findOne({ userId });

      if (!wallet) {
        wallet = new Wallet({
          userId: userId,
          balance: 0,
        });
        await wallet.save();
      }

      const refundAmount = order.totalWithDiscount;

      const transaction = new Transaction({
        userId: userId,
        amount: refundAmount,
        status: "Success",
        type: "Credited",
      });
      await transaction.save();

      wallet.balance += refundAmount;
      await wallet.save();
    }

    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: item.quantity },
      });
    }

    await Order.findByIdAndUpdate(orderId, { status: "Cancelled" });

    res.redirect("/order");
  } catch (error) {
    console.error("Error in cancelOrder:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const retrunProduct = async (req, res) => {
  try {
    const orderId = req.query.orderid;
    const reason = req.body.reason;

    const order = await Order.findOne({ _id: orderId });
    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: item.quantity },
      });
    }
    let wallet = await Wallet.findOne({ userId: order.userId });
    let userId = order.userId;

    if (!wallet) {
      wallet = new Wallet({
        userId: userId,
        balace: 0,
      });
      await wallet.save();
    }
    const refundAmount = order.totalWithDiscount;
    const transaction = new Transaction({
      userId: userId,
      amount: refundAmount,
      status: "Success",
      type: "Credited",
    });
    await transaction.save();

    wallet.balance += refundAmount;
    await wallet.save();

    const updatedOrder = await Order.findByIdAndUpdate(orderId, {
      status: "Returned",
      returnReason: reason,
    });

    res.redirect("/order");
  } catch (error) {
    console.log(error.message);
  }
};

/// ----------------------------------------------razorpay-------------------------

//  orde3r careat first razorpay go page
const createOrder = async (req, res) => {
  const options = {
    amount: req.body.amount * 100,
    currency: "INR",
    receipt: "order_rcptid_11",
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error); // Log any errors
    res.status(500).send({ error: "Failed to create Razorpay order" });
  }
};

// vairigy paayment
const verifyPayment = async (req, res) => {
  const { razorpay_payment_id } = req.body;

  try {
    const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);

    if (payment.status === "captured") {
      const userId = req.session.user._id;

      const { payment_option, address, couponName } = req.body;
      const coupenAddUser = await Coupen.updateOne(
        { coupenCode: couponName },
        {
          $push: { usedBy: userId },
          $inc: { usedCount: 1 },
        }
      );

      const user = await User.findOne({ _id: userId });
      const shippingAddress = await Address.findOne(
        { "addressData._id": address },
        { "addressData.$": 1 }
      );

      const cartItems = await Cart.findOne({ userId: userId });
      const order = new Order({
        userId: userId,
        items: cartItems.items.map((item) => ({
          product: item.product._id,
          price: item.price,
          quantity: item.quantity,
        })),
        totalPrice: cartItems.totalPrice,
        billingDetails: {
          name: user.name,
          email: user.email,
          phno: user.phone,
          address: shippingAddress.addressData[0].address,
          secPnoe: shippingAddress.addressData[0].secphone,
          pincode: shippingAddress.addressData[0].pincode,
          country: shippingAddress.addressData[0].country,
          state: shippingAddress.addressData[0].state,
          city: shippingAddress.addressData[0].city,
        },
        discount: cartItems.discount,
        totalWithDiscount: cartItems.totalWithDiscount,
        paymentMethod: payment_option,
        paymentStatus: "success",
        status: "Pending",
      });

      await order.save();
      console.log("");
      for (let item of cartItems.items) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: -item.quantity },
        });
      }

      await Cart.findOneAndDelete({ userId });
      res.json({
        success: true,
        redirectUrl: `/confirmorder?orderId=${order._id}`,
      });
    } else {
      console.log("Payment verification failed:", payment.status);
      res.json({ success: false, redirectUrl: "/payment/fail" });
    }
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).send({ error: "Failed to verify payment" });
  }
};

// payment pengin
const logOrderCancellation = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { payment_option, address, couponName, transactionStatus } = req.body;

    await Coupen.updateOne(
      { coupenCode: couponName },
      { $push: { usedBy: userId }, $inc: { usedCount: 1 } }
    );

    const user = await User.findOne({ _id: userId });
    const shippingAddress = await Address.findOne(
      { "addressData._id": address },
      { "addressData.$": 1 }
    );
    const cartItems = await Cart.findOne({ userId: userId });

    const order = new Order({
      userId: userId,
      items: cartItems.items.map((item) => ({
        product: item.product._id,
        price: item.price,
        quantity: item.quantity,
      })),
      totalPrice: cartItems.totalPrice,
      billingDetails: {
        name: user.name,
        email: user.email,
        phno: user.phone,
        address: shippingAddress.addressData[0].address,
        secPnoe: shippingAddress.addressData[0].secphone,
        pincode: shippingAddress.addressData[0].pincode,
        country: shippingAddress.addressData[0].country,
        state: shippingAddress.addressData[0].state,
        city: shippingAddress.addressData[0].city,
      },
      discount: cartItems.discount,
      totalWithDiscount: cartItems.totalWithDiscount,
      paymentMethod: payment_option,
      paymentStatus: "Payment Pending",
      status: "Cancelled",
    });

    await order.save();

    // for (let item of cartItems.items) {
    //     await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
    // }
    // await Cart.findOneAndDelete({ userId });

    req.flash("fail", "Transaction Cancelled pls try again");
    res.json({ success: true, redirectUrl: "/order" });
  } catch (error) {
    console.error("Error logging order cancellation:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to log order cancellation" });
  }
};

// -----------------------------------------retry razorpay------------------

const createOrderRetry = async (req, res) => {
  try {
    const { orderId } = req.body;

    const orderFind = await Order.findOne({ _id: orderId });
    const options = {
      amount: orderFind.totalWithDiscount * 100,
      receipt: `order_rcptid_${new Date().getTime()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send({ error: "Failed to create Razorpay order" });
  }
};

const verifyPaymentRetry = async (req, res) => {
  try {
    const userId = req.session.user._id;

    const { orderId } = req.body;
    const orderdata = await Order.findOne({ _id: orderId });

    const orderupdate = await Order.findOneAndUpdate(
      { _id: orderId },
      { $set: { paymentStatus: "success", status: "Pending" } }
    );
    for (let item of orderdata.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    await Cart.findOneAndDelete({ userId });
    res.json({
      success: true,
      redirectUrl: `/confirmorder?orderId=${orderId}`,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// -----------------------------------------end--------------------------------

// invoice get
const invoiceGet = async (req, res) => {
  try {
    const orderId = req.query.id;

    if (orderId) {
      const order = await Order.findOne({ _id: orderId }).populate(
        "items.product"
      );
      if (order) {
        res.render("invoice", { order });
      } else {
        console.log("dont get invoice");
      }
    } else {
      res.redirect("/order");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//--------------------------------------------------- END ------------------------------------------------------
//---------------------------------------------------------- ADMIN SIDE ------------------------------------------------

//get order Lits page
// const getOrderList=async (req,res) =>{
//     try{

//         const order=await Order.find()
//          const msg=req.flash('msg')
//         res.render('orderManagement',{order:order,msg})

//     }catch(error){
//         console.log(error.message);

//     }
// }

const getOrderList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const limit = 4;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .skip(skip)
      .limit(limit)
      .sort({ orderDate: -1 });
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);
    const msg = req.flash("msg");
    res.render("orderManagement", {
      order: orders,
      msg: msg,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//get order details after click details button from the order list page

const orderDeatails = async (req, res) => {
  try {
    const orderId = req.query.id;
    if (orderId) {
      const orderData = await Order.findOne({ _id: orderId }).populate({
        path: "items.product",
        model: "Product",
      });
      const orderStatus = orderData.status;
      res.render("orderUpdate", { order: orderData, orderStatus });
    } else {
      res.redirect("/admin/orderList");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// order update

const orderUpdate = async (req, res) => {
  try {
    const orderId = req.query.id;
    //   console.log(orderId);

    //   console.log(req.body);
    const { choice } = req.body;
    //   console.log(choice);

    if (orderId) {
      const updatOrder = await Order.findByIdAndUpdate(orderId, {
        status: choice,
      });
      req.flash("msg", "order status updated");
      res.redirect("/admin/orderList");
    } else {
      res.redirect("/admin/orderList");
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  //------user--------
  getCheckOut,
  placeOrder,
  confirmOrder,
  getOrderHistory,
  getOrderDeatails,
  cancelOrder,
  retrunProduct,
  verifyPayment,
  createOrder,
  logOrderCancellation,
  invoiceGet,
  createOrderRetry,
  verifyPaymentRetry,
  // -----end------
  //-----admin------
  getOrderList,
  orderDeatails,
  orderUpdate,
};
