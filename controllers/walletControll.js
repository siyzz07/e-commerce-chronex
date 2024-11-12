const Wallet = require("../models/wallet");
const Category = require("../models/category");
const Brand = require("../models/brand");
const Transaction = require("../models/transaction");
const Cart = require("../models/cart");
const Wishlist = require("../models/wishlist");

// get Wallet page

const getWallet = async (req, res) => {
  try {
    const userId = req.session.user._id;

    const transaction = await Transaction.find({ userId: userId }).sort({
      date: -1,
    });
    const category = await Category.find({ isListed: true });
    const brand = await Brand.find({ isListed: true });
    const cart = await Cart.findOne({ userId: userId });
    const wishlist = await Wishlist.findOne({ userId: userId });

    let wallet = await Wallet.findOne({ userId: userId }).populate("userId");

    if (!wallet) {
      wallet = new Wallet({
        userId: userId,
        balace: 0,
      });
      await wallet.save();
    }

    res.render("wallet", {
      category: category,
      brand: brand,
      wallet,
      transaction,
      cart,
      wishlist,
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  getWallet,
};
