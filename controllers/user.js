const User = require("../models/user");
const moment = require("moment");
const filehelper = require("../utils/file");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

exports.getEditProfile = (req, res, next) => {
  return res.render("user/edit-dashboard", {
    pageTitle: "Edit Profile | BoiToi",
    path: "/edit-dashboard",
    user: req.user,
    validationErrors: [],
    errorMessage: null,
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
    return res.status(422).render("user/edit-dashboard", {
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
        console.log("User Updated");
        res.redirect("/dashboard");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
