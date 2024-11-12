const Offer = require("../models/offer");
const Category = require("../models/category");
const Product = require("../models/porduct");

// get offer page list

const offerGet = async (req, res) => {
  try {
    const perPage = 6;
    const currentPage = parseInt(req.query.page) || 1;

    const offerCount = await Offer.countDocuments();
    const offers = await Offer.find()
      .populate("applicableProducts")
      .populate("applicableCategories")
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    const currentDate = new Date();

    for (const offer of offers) {
      if (offer.endDate < currentDate && !offer.isEnded) {
        offer.isEnded = true;
        offer.isListed = false;
        await offer.save();

        for (const productId of offer.applicableProducts) {
          const product = await Product.findById(productId);
          if (product) {
            product.isDiscounted = false;
            product.offerId = null;
            product.offerPercentage = 0;
            product.offerPrice = product.price;
            await product.save();
          }
        }

        for (const categoryId of offer.applicableCategories) {
          const categoryProducts = await Product.find({ category: categoryId });
          for (const product of categoryProducts) {
            product.isDiscounted = false;
            product.offerId = null;
            product.offerPercentage = 0;
            product.offerPrice = product.price;
            await product.save();
          }
        }
      }
    }

    const msg = req.flash("msg");
    const fail = req.flash("fail");

    res.render("offer", {
      offer: offers,
      fail,
      msg,
      currentPage,
      totalPages: Math.ceil(offerCount / perPage),
    });
  } catch (error) {
    console.log(error.message);
  }
};

// addin a new offer get
const addOffer = async (req, res) => {
  try {
    const products = await Product.find({ isPublished: true });
    const categories = await Category.find({ isListed: true });
    res.render("addOffer", { products, categories });
  } catch (error) {
    console.log(error.message);
  }
};

// new offer post form the add ofer page
const postAddOffer = async (req, res) => {
  try {
    const offer = await Offer.findOne({
      offerName: req.body.offerName.toLowerCase(),
    });

    if (offer) {
      req.flash("fail", "The offer is already added");
      return res.redirect("/admin/offer");
    }

    let addoffer;
    if (req.body.offerType === "product") {
      addoffer = new Offer({
        offerName: req.body.offerName,
        offerType: req.body.offerType,
        discountPercentage: req.body.discountPercentage,
        endDate: req.body.endDate,
        applicableProducts: req.body.applicableProducts,
      });
    } else {
      addoffer = new Offer({
        offerName: req.body.offerName,
        offerType: req.body.offerType,
        discountPercentage: req.body.discountPercentage,
        endDate: req.body.endDate,
        applicableCategories: req.body.applicableCategories,
      });
    }

    const offeradd = await addoffer.save();
    const percentage = offeradd.discountPercentage;

    if (offeradd.offerType === "product") {
      for (const productId of offeradd.applicableProducts) {
        let productOffer = await Product.findById(productId);

        if (productOffer) {
          if (productOffer.offerPercentage < percentage) {
            const price = productOffer.price;
            const offerPrice = price - (price * percentage) / 100;

            productOffer.offerPrice = offerPrice;
            productOffer.isDiscounted = true;
            productOffer.offerId = offeradd._id;
            productOffer.offerPercentage = percentage;
            await productOffer.save();
          }
        }
      }
    } else {
      for (const categoryId of offeradd.applicableCategories) {
        let categoryProducts = await Product.find({ category: categoryId });

        for (const productOffer of categoryProducts) {
          if (productOffer.offerPercentage < percentage) {
            const price = productOffer.price;
            const offerPrice = price - (price * percentage) / 100;

            productOffer.offerPrice = offerPrice;
            productOffer.isDiscounted = true;
            productOffer.offerId = offeradd._id;
            productOffer.offerPercentage = percentage;
            await productOffer.save();
          }
        }
      }
    }

    req.flash("msg", "Offer added successfully");
    res.redirect("/admin/offer");
  } catch (error) {
    console.log("Error:", error.message);
    req.flash("fail", "Error adding offer");
    res.redirect("/admin/offer");
  }
};

// edit offer get

const editOfferGet = async (req, res) => {
  try {
    const offerId = req.query.id;
    if (!offerId) {
      res.redirect("/admin/offer");
    } else {
      const offer = await Offer.findOne({ _id: offerId });
      const products = await Product.find({ isPublished: true });
      const categories = await Category.find({ isListed: true });

      res.render("editOffer", { products, categories, offer });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// edit offer
const editOffer = async (req, res) => {
  try {
    const offerId = req.params.id;
    const existOffer = await Offer.findOne({
      offerName: req.body.offerName,
      _id: { $ne: offerId },
    });

    if (existOffer) {
      req.flash("fail", "Offer Already Exist");
      res.redirect("/admin/offer");
    } else {
      const updatedOffer = {
        offerName: req.body.offerName,
        offerType: req.body.offerType,
        discountPercentage: req.body.discountPercentage,
        endDate: req.body.endDate,
        applicableProducts: req.body.applicableProducts,
        applicableCategories: req.body.applicableCategories,
      };

      await Offer.findByIdAndUpdate(offerId, updatedOffer);

      req.flash("msg", "Offer Updated");
      res.redirect("/admin/offer");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// unlist offer

const unlistOffers = async (req, res) => {
  try {
    const offerId = req.query.id;

    const unlistedOffer = await Offer.findByIdAndUpdate(
      offerId,
      { isListed: false },
      { new: true }
    );

    if (!unlistedOffer) {
      console.log("Offer not found");
      req.flash("fail", "Offer not found");
      return res.redirect("/admin/offer");
    }

    if (
      unlistedOffer.offerType === "product" &&
      unlistedOffer.applicableProducts.length > 0
    ) {
      for (const productId of unlistedOffer.applicableProducts) {
        const product = await Product.findById(productId);

        if (product) {
          if (product.offerId) {
            if (product.offerId.toString() === offerId) {
              product.offerId = null;
              product.offerPercentage = 0;
              product.offerPrice = product.price;
              product.isDiscounted = false;

              await product.save();
            }
          } else {
            product.offerId = null;
            product.offerPercentage = 0;
            product.offerPrice = product.price;
            product.isDiscounted = false;

            await product.save();
          }
        }
      }
    } else if (
      unlistedOffer.offerType === "category" &&
      unlistedOffer.applicableCategories.length > 0
    ) {
      for (const categoryId of unlistedOffer.applicableCategories) {
        const categoryProducts = await Product.find({ category: categoryId });

        for (const product of categoryProducts) {
          if (product.offerId) {
            if (product.offerId.toString() === offerId) {
              product.offerId = null;
              product.offerPercentage = 0;
              product.offerPrice = product.price;
              product.isDiscounted = false;

              await product.save();
            }
          } else {
            product.offerId = null;
            product.offerPercentage = 0;
            product.offerPrice = product.price;
            product.isDiscounted = false;
          }
        }
      }
    }

    req.flash("msg", "Offer successfully unlisted and products updated");
    res.redirect("/admin/offer");
  } catch (error) {
    console.log(error.message);
  }
};

// List offer
const listOffers = async (req, res) => {
  try {
    const offerId = req.query.id;

    const listedOffer = await Offer.findByIdAndUpdate(
      offerId,
      { isListed: true },
      { new: true }
    );

    if (!listedOffer) {
      console.log("Offer not found");
      req.flash("fail", "Offer not found");
      return res.redirect("/admin/offer");
    }

    const percentage = listedOffer.discountPercentage;

    if (
      listedOffer.offerType === "product" &&
      listedOffer.applicableProducts.length > 0
    ) {
      for (const productId of listedOffer.applicableProducts) {
        const product = await Product.findById(productId);

        if (product) {
          if (product.offerPercentage < percentage) {
            product.isDiscounted = true;
            product.offerId = listedOffer._id;
            product.offerPercentage = percentage;
            product.offerPrice = Math.floor(
              product.price - (product.price * percentage) / 100
            );

            await product.save();
          }
        }
      }
    } else if (
      listedOffer.offerType === "category" &&
      listedOffer.applicableCategories.length > 0
    ) {
      for (const categoryId of listedOffer.applicableCategories) {
        const categoryProducts = await Product.find({ category: categoryId });

        for (const product of categoryProducts) {
          if (product.offerPercentage < percentage) {
            product.isDiscounted = true;
            product.offerId = listedOffer._id;
            product.offerPercentage = percentage;
            product.offerPrice = Math.floor(
              product.price - (product.price * percentage) / 100
            );

            await product.save();
          }
        }
      }
    }

    req.flash("msg", "Offer successfully listed and products updated");
    res.redirect("/admin/offer");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  offerGet,
  addOffer,
  postAddOffer,
  editOfferGet,
  editOffer,
  unlistOffers,
  listOffers,
};
