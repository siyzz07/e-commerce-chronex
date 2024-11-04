const coupen = require("../models/coupen");
const Coupen = require("../models/coupen");
const Cart = require("../models/cart");

//----------------------------------------------- ADMIN -----------------------------------------------------------------

// get coupen getPage
const getCoupenPage = async (req, res) => {
  try {
    const coupen = await Coupen.find();
    const msg = req.flash("msg");
    const fail = req.flash("fail");
    res.render("coupen", { fail, coupen, msg });
  } catch (error) {
    console.log(error.message);
  }
};

// addcoupen get

const getAddCoupen = async (req, res) => {
  try {
    res.render("addCoupen");
  } catch (error) {
    console.log(error.message);
  }
};

// post the details from the add coupen page
const postAddCoupen = async (req, res) => {
  try {
    const { code, description, discount, min, max, date } = req.body;

    let coupen = await Coupen.findOne({ coupenCode: code });
    if (!coupen) {
      coupen = new Coupen({
        coupenCode: code,
        description: description,
        discountPercentage: discount,
        expiryDate: date,
        minAmountPurchase: min,
      });

      await coupen.save();

      req.flash("msg", "Coupen added Succesfuly");
      res.redirect("/admin/coupen");
    } else {
      req.flash("fail", "Coupen is alredy added");
      res.redirect("/admin/coupen");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// delete coupen
const deleteCoupen = async (req, res) => {
  try {
    const coupenId = req.query.id;
    const coupen = await Coupen.findByIdAndDelete({ _id: coupenId });
    req.flash("msg", "Coupen deleted successfully");
    res.redirect("/admin/coupen");
  } catch (error) {
    console.log(error.message);
  }
};

//----------------------------------------------- END --------------------------------------------------------------------
//----------------------------------------------------- USER ---------------------------------------------------------------

// in chek out page the modaal the availabel coupen for that usershow  in the modal that code  writen in  ordercontroller ( load checkoup page  from user side)

// after clicking the applay coupen in checkout page

const applyCoupen = async (req, res) => {
  try {
    const cartId = req.query.cartId;

    const couponCode = req.body.couponCode;

    let coupen = await Coupen.findOne({ coupenCode: couponCode });

    if (coupen) {
      let cart = await Cart.findOne({ _id: cartId });
      let totalPrice = cart.totalPrice;
      let discount = coupen.discountPercentage;
      let discountAmount = (totalPrice / 100) * discount;
      let totalWithDiscount = totalPrice - discountAmount;

      await Cart.findByIdAndUpdate(cartId, {
        discount: discountAmount,
        totalWithDiscount: totalWithDiscount,
      });

      req.flash("msg", "Coupen Added");
      res.redirect(`/checkOut?coupenName=${coupen.coupenCode}`);
    } else {
      req.flash("fail", "Invalied Coupen");

      res.redirect(`/checkOut`);
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Delet the coupen
const deletCoupen = async (req, res) => {
  try {
    req.flash("msg", "Coupen Deleted");
    res.redirect("/checkOut");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  // -----admin------
  getCoupenPage,
  getAddCoupen,
  postAddCoupen,
  deleteCoupen,
  // -----end---------
  // -----user--------
  applyCoupen,
  deletCoupen,
};
