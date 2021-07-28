const Product = require("../models/product");
const Category = require("../models/category");
const moment = require("moment");
const filehelper = require("../utils/file");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Order = require("../models/order");
const User = require("../models/user");

// =================== **Admin Dashboard** ===============================
exports.getProfile = (req, res, next) => {
  Order.find().then((orders) => {
    return res.render("admin/dashboard", {
      pageTitle: "Admin Dashboard | BoiToi",
      path: "/admin/dashboard",
      orders: orders,
    });
  });
};

exports.getEditProfile = (req, res, next) => {
  Order.find()
    .then((orders) => {
      return res.render("admin/edit-dashboard", {
        pageTitle: "Edit Profile | BoiToi",
        path: "/admin/edit-dashboard",
        user: req.user,
        orders: orders,
        validationErrors: [],
        errorMessage: null,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProfile = (req, res, next) => {
  const updatedName = req.body.name;
  const updatedEmail = req.body.email;
  const updatedBirth = req.body.date;
  const updatedPhone = req.body.phone;
  const image = req.file;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Profile | BoiToi",
      path: "/edit-profile",
      user: {
        name: updatedName,
        email: updatedEmail,
        Mobile_No: updatedPhone,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  User.findById(req.user._id)
    .then((user) => {
      user.name = updatedName;
      user.email = updatedEmail;
      user.Date_of_Birth = updatedBirth;
      user.Mobile_No = updatedPhone;

      if (image) {
        filehelper.deleteFile(user.imageUrl);
        user.imageUrl = image.path;
      }
      return user.save().then((result) => {
        console.log("Admin Updated");
        res.redirect("/admin/dashboard");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// =================== ** Admin Products** ===============================
exports.getProduct = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render("admin/products", {
        pageTitle: "Admin Products",
        prods: products,
        path: "/admin/products",
      });
    })
    .catch((err) => {
      // const error = new Error(err);
      // error.httpStatusCode = 500;
      // return next(error);
      console.log(err);
    });
};

// =================== ** Admin product functionality** ===========================
exports.getAddProduct = (req, res, next) => {
  Category.find()
    .then((categories) => {
      console.log(categories);
      res.render("admin/add-product", {
        pageTitle: "Add Product",
        editing: false,
        errorMessage: null,
        categories: categories,
        validationErrors: [],
        path: "/admin/add-product",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddProduct = (req, res, next) => {
  const name = req.body.name;
  const updatedName = name.toLowerCase();
  const authorName = req.body.aname;
  const copies = req.body.copy;
  const category = req.body.category;
  const price = req.body.price;
  const description = req.body.description;
  const image = req.file;
  // console.log("image: ", image);
  const uploadedDate = moment().format("LLL");

  if (!image) {
    Category.find().then((categories) => {
      return res.status(422).render("admin/add-product", {
        pageTitle: "Add Product",
        categories: categories,
        editing: false,
        product: {
          name: updatedName,
          price: price,
          copy: copies,
          authorName: authorName,
          description: description,
        },
        errorMessage: "Attached file is not image",
        validationErrors: [],
        path: "/admin/add-product",
      });
    });
  }
  const errors = validationResult(req);
  console.log(errors);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    Category.find()
      .then((categories) => {
        console.log("categories", categories);
        return res.status(422).render("admin/add-product", {
          pageTitle: "Add Product",
          categories: categories,
          editing: false,
          product: {
            name: updatedName,
            price: price,
            copy: copies,
            authorName: authorName,
            description: description,
          },
          errorMessage: errors.array()[0].msg,
          validationErrors: errors.array(),
          path: "/admin/add-product",
        });
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  }

  const imageUrl = image.path;

  const product = new Product({
    name: updatedName,
    price: price,
    copy: copies,
    authorName: authorName,
    category: category,
    description: description,
    imageUrl: imageUrl,
    uploadTime: uploadedDate,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      // console.log(result);
      // console.log("Created Product");
      // console.log("unpou", category);
      return Category.findOne({ name: category }).then((cat) => {
        // console.log("res", result);
        // console.log("categor", cat);
        cat.products.push({ Product: result });
        return cat.save().then((ree) => {
          res.redirect("/");
        });
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Category.find()
    .then((categories) => {
      Product.findById(prodId).then((product) => {
        res.render("admin/add-product", {
          pageTitle: "Edit Product",
          prods: product,
          categories: categories,
          editing: editMode,
          validationErrors: [],
          errorMessage: null,
          path: "/admin/add-product",
        });
      });
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedName = req.body.name;
  const updatedAuthorName = req.body.aname;
  const updatedCategory = req.body.category;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  const image = req.file;
  console.log(prodId);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product | BoiToi",
      editing: true,
      path: "/admin/add-product",
      prods: {
        name: updatedName,
        price: updatedPrice,
        authorName: updatedAuthorName,
        description: updatedDesc,
        category: updatedCategory,
        _id: prodId,
      },
      user: req.user,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  Product.findById(prodId)
    .then((product) => {
      console.log("propd ", product);
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redierect("/");
      }
      product.name = updatedName;
      product.price = updatedPrice;
      product.authorName = updatedAuthorName;
      product.description = updatedDesc;
      product.category = updatedCategory;

      if (image) {
        filehelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save().then((result) => {
        console.log("Product Updated");
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        console.log("there is no product");
        return res.redierect("/");
      }
      filehelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    // .then((res) => {
    //   return req.user.clearWishList(prodId);
    // })
    // .then((res) => {
    //   console.log("category", res);
    //   Category.findOne({ name: product.category }).then((cat) => {
    //     return cat.clearProduct(product);
    //   });
    // })
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.status(200).json({ message: "Success!" });
    })
    .catch((err) => {
      res.status(500).json({ message: "Deleting product failed." });
    });
};

// =================== ** Admin category functionality** ==========================

exports.getAddCategory = (req, res, next) => {
  res.render("admin/add-category", {
    pageTitle: " Add Category | BoiToi ",
    errorMessage: null,
    validationErrors: [],
    path: "/admin/add-category",
  });
};

exports.postAddCategory = (req, res, next) => {
  const name = req.body.name;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/add-category", {
      pageTitle: "Add Category | BoiToi",
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      path: "/admin/add-category",
    });
  }

  const category = new Category({
    name: name,
  });
  category
    .save()
    .then((resu) => {
      console.log(resu);
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};

// =================== ** Admin discount functionality** ==========================
exports.getDiscount = (req, res, next) => {
  let prodId = req.params.productId;
  prodId = mongoose.Types.ObjectId(prodId);

  // console.log(prodId);
  Product.findById(prodId)
    .then((product) => {
      res.render("admin/add-discount", {
        pageTitle: "Add Discount | BoiToi",
        errorMessage: null,
        validationErrors: [],
        path: "/admin/add-discount",
        product: product,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDiscount = (req, res, next) => {
  let prodId = req.body.productId;
  prodId = mongoose.Types.ObjectId(prodId);
  const expireDate = parseInt(req.body.date);
  // console.log(typeof expireDate);
  const newPrice = parseInt(req.body.newPrice);
  // console.log(typeof newPrice);
  var someDate = new Date();
  var numberOfDaysToAdd = expireDate;
  someDate.setDate(someDate.getDate() + numberOfDaysToAdd);
  // console.log(typeof someDate, " ", someDate);
  Product.findById(prodId)
    .then((product) => {
      req.product = product;
      return req.product.addDiscount(someDate, newPrice);
    })
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// ==================  ** GEt Publishers List** ===================================

exports.getPublisherList = (req, res, next) => {
  Product.find().then((prods) => {
    User.find().then((users) => {
      res
        .render("admin/publisher-list", {
          pageTitle: "Publisher List | BoiToi",
          path: "/admin/publisher-list",
          users: users,
          prods: prods,
        })
        .catch((err) => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    });
  });
};
