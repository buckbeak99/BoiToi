const express = require("express");
const router = express.Router();
const { check, body } = require("express-validator/check");

const publisherAuthController = require("../controllers/publisher-auth");

const user = require("../models/user");

router.get("/publisher/signup", publisherAuthController.getAdminSignUp);

router.post(
  "/publisher/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        // if (value === 'test@test.com') {
        //   throw new Error('This email address if forbidden.');
        // }
        // return true;
        return user.findOne({ email: value }).then((userDoc) => {
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
  publisherAuthController.postSignUp
);

router.get("/verification/:token", publisherAuthController.getCode);

router.post(
  "/new-account",
  [
    body("code")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.code) {
          throw new Error("Codes does not match!");
        }
        return true;
      }),
  ],
  publisherAuthController.postCode
);

module.exports = router;
