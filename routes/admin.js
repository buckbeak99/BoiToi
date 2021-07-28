const express = require("express");
const adminController = require("../controllers/admin");
const isAuth = require("../middlewares/isAuth");

const { body } = require("express-validator");

const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProduct);

router.post(
  "/add-product",
  [
    body("name")
      .isString()
      .isLength({ min: 3 })
      .trim()
      .withMessage("Name Length muse be minimum 3"),
    body("aname").isString(),
    body("category").isString(),
    body("price").isFloat(),
    body("copy").isNumeric(),
    body("description")
      .isLength({ min: 5, max: 400 })
      .trim()
      .withMessage("Description length must be minimum 5"),
  ],
  isAuth,
  adminController.postAddProduct
);

router.get("/add-category", isAuth, adminController.getAddCategory);
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/add-category",
  [body("name").isString().isAlpha().isLength({ min: 3 }).trim()],
  isAuth,
  adminController.postAddCategory
);
router.post(
  "/edit-product/",
  [
    body("name").isString().isLength({ min: 3 }).trim(),
    body("aname").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postEditProduct
);
router.get("/products", isAuth, adminController.getProduct);

router.delete("/product/:productId", isAuth, adminController.deleteProduct);

router.get("/add-discount/:productId", isAuth, adminController.getDiscount);

router.post("/add-discount", isAuth, adminController.postDiscount);

router.get("/dashboard", adminController.getProfile);

router.get("/edit-profile", adminController.getEditProfile);

router.post("/edit-profile",adminController.postEditProfile);

router.get('/publisher-list',adminController.getPublisherList);



module.exports = router;
