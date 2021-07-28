const express = require("express");

const router = express.Router();

const { body } = require("express-validator");

const shopController = require("../controllers/shop");

const isAuth = require("../middlewares/isAuth");

router.get("/", shopController.getIndex);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.post("/add-cart-with-quantity", isAuth, shopController.postCartWithQty); 

router.post("/cart-delete-item", isAuth, shopController.deleteCartItem);

router.post("/cart-wishlist-item", isAuth, shopController.deleteWishlisttItem);

router.post("/add-to-whishlist", isAuth, shopController.postWishlist);

router.post("/remove-from-whishlist", shopController.removeFromWhislist);

router.post(
  "/review-product",
  [body("product-review").isLength({ min: 5, max: 400 }).trim()],
  isAuth,
  shopController.reviewProduct
);

// router.get("/products/:productId/prod-review", shopController.reviewPagination);

router.get("/checkout", isAuth, shopController.getCheckout);

router.get("/create-order", isAuth, shopController.postOrder);

router.get("/orders", isAuth, shopController.getOrder);

router.get("/search-products", shopController.getSearchResults);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

router.get('/categories', shopController.getCategories);

router.get('/dashboard', isAuth, shopController.getDashboard);

router.get("/track", shopController.getTrackInfo);

router.post('/track',shopController.postTrack);

module.exports = router;
