const Category = require("../models/category");
const Brand = require("../models/brand");

//------------------ LOAD CATEGORY PAGE -------------------------------------
const category = async (req, res) => {
  const category = await Category.find({});
  // console.log(category);

  try {
    const msg1 = req.flash("msg1");
    const fail = req.flash("fail");
    const msg = req.flash("msg");
    const fail2 = req.flash("fail2");
    res.render("categorys", { category: category, msg, fail, msg1, fail2 });
  } catch (error) {
    console.log(error.message);
  }
};

//------------------------- ADD CATEGORY IN CATEGORY PAGE ---------------------

const addCategory = async (req, res) => {
  const category = await Category.findOne({
    category: req.body.category.toLowerCase(),
  });

  try {
    if (category) {
      req.flash("fail", "category already added");
      res.redirect("/admin/category");
    } else {
      const category = new Category({
        category: req.body.category,
        description: req.body.description,
      });
      const insertedCategory = await category.save();

      req.flash("msg", "category added");
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//--------------------- DELETE THE CATEGORY ----------------------------
const deletCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const deletCategory = await Category.findByIdAndDelete({ _id: id });
    req.flash("msg1", "category deleted successfully");
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

// ------------------ LIST CATEGORY ------------------------
const listCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const listCategory = await Category.findByIdAndUpdate(id, {
      isListed: true,
    });
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

// ---------------------- UNLIST CATEGORY -------------------------
const unlistCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const unlist = await Category.findByIdAndUpdate(id, { isListed: false });
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

//--------------------- LOGAD THE EDIT CATEGORY PAGE ---------------------------
const loadEditCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const updateCategoryData = await Category.findOne({ _id: id });
    if (updateCategoryData) {
      res.render("editCategory", { data: updateCategoryData });
    } else {
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//------------------ POST THE EDIT CATEGORY PAGE ----------------------
const editCategoryPost = async (req, res) => {
  try {
    const category = req.body.category;
    const check = await Category.findOne({ category: category.toLowerCase() });
    if (check) {
      req.flash("fail2", "already added");
      return res.redirect("/admin/category");
    }

    const edit = await Category.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          category: req.body.category,
          description: req.body.description,
        },
      }
    );
    if (edit) {
      req.flash("msg1", "Category updated successfully");
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  category,
  addCategory,
  deletCategory,
  listCategory,
  unlistCategory,
  loadEditCategory,
  editCategoryPost,
};
