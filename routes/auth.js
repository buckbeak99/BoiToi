const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth");

const isNotAuth = require("../middlewares/isNotAuth");

const { check, body } = require("express-validator/check");

const User = require("../models/user");

router.get("/signup", isNotAuth, authController.getSignup);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        // if (value === 'test@test.com') {
        //   throw new Error('This email address if forbidden.');
        // }
        // return true;
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-Mail exists already, please pick a different one."
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to match!");
        }
        return true;
      }),
  ],
  authController.postSignUp
);

router.get("/login", isNotAuth, authController.getlogin);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    body("password", "Password did not Match.")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

router.get("/reset", isNotAuth, authController.getReset);

router.post("/reset", isNotAuth, authController.postReset);

router.get("/reset/:token", isNotAuth, authController.getNewPassword);

router.post("/new-password", isNotAuth, authController.postNewPassword);

router.get("/logout", authController.postLogout);



module.exports = router;
