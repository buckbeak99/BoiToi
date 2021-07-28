const express = require("express");

const router = express.Router();

const isAuth = require("../middlewares/isAuth");

const { check, body } = require("express-validator/check");

const userController = require("../controllers/user");

router.get("/edit-profile", isAuth, userController.getEditProfile);

router.post(
  "/edit-profile",
  [
    body("name").isString().isLength({ min: 3 }).trim(),
    body("email")
      .isEmail()
      .normalizeEmail()
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
      .withMessage("Please enter a valid email."),
    body("phone").isLength({ min: 11, max: 11 }).isNumeric().trim(),
  ],
  isAuth,
  userController.postEditProfile
);

module.exports = router;
