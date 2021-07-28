const User = require("../models/user");
const moment = require("moment");
const filehelper = require("../utils/file");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Product = require("../models/product");
const RecentProds = require("../models/recentProducts");
const Order = require("../models/order");
// ===============  ** Publisher profile functionality ** =================
exports.getDashboard = (req, res, next) => {
  Product.find()
    .then((prods) => {
      Order.find().then((orders) => {
        return res.render("publisher/dasboard", {
          pageTitle: "Dashboard | BoiToi",
          path: "/dashboard",
          prods: prods,
          orders: orders,
        });
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
  const updatedDesc = req.body.des;
  const updatedPhone = req.body.phone;
  const image = req.file;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).render("publisher/edit-dashboard", {
      pageTitle: "Edit Profile | BoiToi",

      path: "/edit-profile",
      user: {
        name: updatedName,
        email: updatedEmail,
        Mobile_No: updatedPhone,
        description: updatedDesc,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  User.findById(req.user._id)
    .then((user) => {
      user.name = updatedName;
      user.email = updatedEmail;
      user.Mobile_No = updatedPhone;
      user.description = updatedDesc;

      if (image) {
        filehelper.deleteFile(user.imageUrl);
        user.imageUrl = image.path;
      }
      return user.save().then((result) => {
        console.log("Publisher Updated");
        res.redirect("/publisher/dashboard");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProfile = (req, res, next) => {
  res.render("publisher/edit-dashboard", {
    pageTitle: "Edit Dashboard",
    path: "/publisher/dashboard",
    user: req.user,
    validationErrors: [],
    errorMessage: null,
  });
};
