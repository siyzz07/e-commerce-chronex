const Brand=require('../models/brand')
const Category = require("../models/category");





//---------- LOAD BRAND PAGE -------------
const brand = async (req, res) => {
    try {
    const brand = await Brand.find();
      const msg1 = req.flash("msg1");
      const fail = req.flash("fail");
      const msg = req.flash("msg");
      const fail2=req.flash('fail2')
      res.render("brand", { brand: brand, msg, fail, msg1,fail2 });
    } catch (error) {
      console.log(error.message);
    }
  };



  //------------------- ADD BRANDS IN BRAND PAGE -----------------------------
const addBrand = async (req, res) => {
    const brandcheck = await Brand.findOne({ brand: req.body.brand.toLowerCase() });
    try {
      if (brandcheck) {
        req.flash("fail", "Bradn already added");
        res.redirect("/admin/brand");
      } else {
        const brand = new Brand({
          brand: req.body.brand,
          description: req.body.description,
        });
        const insertedbradnd = await brand.save();
        req.flash("msg", "Brand added");
        res.redirect("/admin/brand");
      }
    } catch (error) {
      console.log(error.message);
    }
  };


  //----------------- DELETE BRAND -----------------------------
const deleteBrand = async (req, res) => {
    try {
      const id = req.query.id;
      const deletebrand = await Brand.findByIdAndDelete({ _id: id });
      req.flash("msg1", "Brand deleted successfully");
      res.redirect("/admin/brand");
    } catch (error) {
      console.log(error.message);
    }
  };



  //---------------- LIST BRAND -------------------
const listBrand = async (req, res) => {
    try {
      const id = req.query.id;
      const listbrand = await Brand.findByIdAndUpdate(id, { isListed: true });
      res.redirect("/admin/brand");
    } catch (error) {
      console.log(error.message);
    }
  };
  

  //--------------------- UNLIST BRAND ---------------------------
const unlistBrand = async (req, res) => {
    try {
      const id = req.query.id;
      const unslistbrand = await Brand.findByIdAndUpdate(id, { isListed: false });
      res.redirect("/admin/brand");
    } catch (error) {
      console.log(error.message);
    }
  };

  //--------------- LOAD EDIT BRAND PAGE --------------------------
const editBrand = async (req, res) => {
    try {
      const id = req.query.id;
      const updateBrandData = await Brand.findOne({ _id: id });
  
      if (updateBrandData) {
        res.render("editBrand", { data: updateBrandData });
      } else {
        res.redirect("/admin/brand");
      }
    } catch (error) {
      console.log(error.message);
    }
  };


  //----------------- POST THE EDIT PAGE -------------------------
const edit = async (req, res) => {
    try {

      const brand =req.body.brand
      const check=await Brand.findOne({brand:brand.toLowerCase()})
      if(check){
        req.flash('fail2','already added')
        return res.redirect('/admin/brand')

      }


      const edit = await Brand.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            brand: req.body.brand,
            description: req.body.description,
          },
        }
      );
  
      if (edit) {
        req.flash("msg1", "Brand updated successfully");
        res.redirect("/admin/brand");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  module.exports={
    brand,
    addBrand,
    deleteBrand,
    listBrand,
    unlistBrand,
    editBrand,
    edit
  }