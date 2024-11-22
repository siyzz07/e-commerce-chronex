const Cart = require("../models/cart");
const Category = require("../models/category");
const Brand = require("../models/brand");
const Product = require("../models/porduct");
const { productDetails } = require("./userControl");
const Coupen = require("../models/coupen");
const Wishlist = require("../models/wishlist");

//------add product to cart from product details  page click add to cart
const addToCart = async (req, res) => {
  try {
    const productId = req.query.id;
    const userId = req.session.user._id;
    const product = await Product.findOne({ _id: productId });

    let price;
    if (product.isDiscounted) {
      price = product.offerPrice;
    } else {
      price = product.price;
    }

    let cart = await Cart.findOne({ userId: userId });

    if (!cart) {
      cart = new Cart({
        userId: userId,
        items: [
          {
            product: productId,
            price: price,
            quantity: 1,
          },
        ],
        totalPrice: price,
      });
    } else {
      const existCartItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existCartItem) {
        req.flash("fail", "Product already added");
        return res.redirect(`/productdetails?id=${productId}`);
      }

      cart.items.push({
        product: productId,
        price: price,
        quantity: 1,
      });
      cart.totalPrice += price;
    }

    // Save the updated cart
    await cart.save();
    req.flash("msg", "Product added to cart");
    res.redirect(`/productdetails?id=${productId}`);
  } catch (error) {
    console.log(error.stack);
    res.status(500).render('500')
  }
};

//--------add product to cart from product wishlist page click add to cart
const addToCartFromWishlist = async (req, res) => {
  try {
    const productId = req.query.id;
    const userId = req.session.user._id;
    const procuct = await Product.findOne({ _id: productId });
    const price = procuct.price;
    // console.log(procuct);

    let cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      cart = new Cart({
        userId: userId,

        items: [
          {
            product: productId,
            price: price,
            quantity: 1,
          },
        ],
      });
    } else {
      const existCart = await Cart.findOne({
        userId: userId,
        "items.product": productId,
      });

      if (existCart) {
        req.flash("fail", "product already added");
        return res.redirect(`/wishlist`);
      }
      cart.items.push({
        product: productId,
        price: price,
        quantity: 1,
      });
    }
    await cart.save();
    req.flash("msg", "product added to cart");
    res.redirect(`/wishlist`);
  } catch (error) {
    console.log(error.stack);
    res.status(500).render('500')
  }
};

// ---------get cart page and sees the cart total
const getCart = async (req, res) => {
  try {
    const userId = req.session.user._id;

    const cart = await Cart.findOne({ userId: userId });
    const wishlist = await Wishlist.findOne({ userId: userId });

    const category = await Category.find({ isListed: true });
    const brand = await Brand.find({ isListed: true });
    
    const cartData = await Cart.findOne({ userId: userId }).populate({
      path: "items.product",
      populate: [
        { path: "category", model: "Catetgory" },
        { path: "brandName", model: "Brand" },
      ],
    });
    
    if (!cartData) {
      req.flash("fail", "Cart not found.");
      return res.redirect("/cart"); // Redirect or handle as needed
    }
    



    // Calculate the total price of blocked products
    let sumBlockedPrice = cartData.items.reduce((acc, val) => {
      if (val.product.isBlocked == false) {
        acc += val.price;
      }
      return acc;
    }, 0);

    
    
    
    if (sumBlockedPrice > 0) {
      cartData.totalPrice -= sumBlockedPrice; 
     cartData.totalWithDiscount=cartData.totalPrice
      cartData.items = cartData.items.filter(item => item.product.isBlocked === true); 
      await cartData.save(); 
     
      req.flash("fail", "Some products are not available and have been removed from your cart.");
    } 
    

    const msg = req.flash("msg");
    const fail = req.flash("fail");

    res.render("cart", {
      category: category,
      brand: brand,
      cartData: cartData || { items: [] },
      msg,
      fail,
      cart,
      wishlist,
    });
  } catch (error) {
    console.log(error.stack);
    res.status(500).render('500')
  }
};



// ---------update cart

const updateCart = async (req, res) => {
  try {
    const { productId, quantity, subtotal } = req.body;
    const userId = req.session.user._id;

    // Update the specific item in the cart
    await Cart.updateOne(
      { userId: userId, "items.product": productId },
      {
        $set: {
          "items.$.quantity": quantity,
          "items.$.price": subtotal,
        },
      }
    );

    // Recalculate total price for the cart
    const cart = await Cart.findOne({ userId: userId });
    const totalPrice = cart.items.reduce(
      (total, item) => total + item.price,
      0
    );

    // Update cart totals
    await Cart.updateOne(
      { userId: userId },
      { totalPrice: totalPrice, totalWithDiscount: totalPrice, discount: 0 }
    );

    res
      .status(200)
      .json({ message: "Cart item updated successfully", totalPrice });
  } catch (error) {
    console.log(error.stack);
    res.status(500).render('500')
  }
};

// delete the product form the cart
// const deleFromCart = async (req, res) => {
//   try {
//     const userId = req.session.user._id;
//     const productId = req.query.id;
//     // console.log(productId);

//     const deletproduct = await Cart.updateOne(
//       { userId },
//       { $pull: { items: { product: productId } } }
//     );
//     if (deletproduct.modifiedCount !== 0) {
//       req.flash("msg", "product deleted");
//       res.redirect("/cart");
//     } else {
//       req.flash("fail", "delet falied ");
//       res.redirect("/cart");
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const deleFromCart = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const productId = req.query.id;

    // Find the cart and the item to delete
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      req.flash("fail", "Cart not found");
      return res.redirect("/cart");
    }

    // Find the item price for the product to be deleted
    const itemToDelete = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!itemToDelete) {
      req.flash("fail", "Product not found in cart");
      return res.redirect("/cart");
    }

    const itemPrice = itemToDelete.price;

    // Delete the product from the cart
    const deleteProduct = await Cart.updateOne(
      { userId },
      { $pull: { items: { product: productId } } }
    );

    if (deleteProduct.modifiedCount !== 0) {
      // Update the cart's total price by subtracting the deleted item's price
      const newTotalPrice = cart.totalPrice - itemPrice;
      const newTotalWithDiscount = newTotalPrice - cart.discount; // Adjust for any existing discount

      await Cart.updateOne(
        { userId },
        {
          totalPrice: newTotalPrice,
          totalWithDiscount:
            newTotalWithDiscount >= 0 ? newTotalWithDiscount : 0, // Ensure it doesn’t go negative
        }
      );

      req.flash("msg", "Product deleted and total updated");
      res.redirect("/cart");
    } else {
      req.flash("fail", "Delete failed");
      res.redirect("/cart");
    }
  } catch (error) {
    console.log(error.stack);
    res.status(500).render('500')
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCart,
  deleFromCart,
  // getCheckOut
  addToCartFromWishlist,
};
