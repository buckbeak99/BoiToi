const Product = require("../models/product");
const Order = require("../models/order");
const RecentProducts = require("../models/recentProducts");
const moment = require("moment");
const Category = require("../models/category");
const helpCart = require("../utils/manageCart");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Review = require("../models/review");
const REVIEW_PER_PAGE = 5;
const PDFDocument = require("pdfkit");
const stripe = require("stripe")(process.env.STRIPE_KEY);

// ===================== ** Producsts ** =====================
exports.getIndex = (req, res, next) => {
  Category.find()
    .then((categories) => {
      RecentProducts.find()
        .sort({ orderTime: -1 })
        .then((orders) => {
          Product.find().then((products) => {
            // finds top sold products
            let p, o;
            const unsortedProds = [];
            for (p = 0; p < products.length; p++) {
              for (o = 0; o < orders.length; o++) {
                if (products[p].name == orders[o].product.name) {
                  unsortedProds.push(products[p]);
                }
              }
            }

            const sortedProds = unsortedProds.sort(
              (a, b) => b.OrderedAmount - a.OrderedAmount
            );
            let flags = [],
              output = [],
              l = orders.length,
              i,
              j,
              k,
              updatedRecentProducts = [],
              updatedProducts = [];
            // for removing duplicate values in recent sold products
            for (i = 0; i < l; i++) {
              if (flags[orders[i].product.name]) continue;
              flags[orders[i].product.name] = true;
              output.push(orders[i]);
            }
            console.log("orders: ", output);
            console.log("prod controleler: ", products);
            // for connecting with order and products
            // for (j = 0; j < products.length; j++) {
            //   for (k = 0; k < l; k++) {
            //     if (
            //       products[j]._id.toString() == output[k].product._id.toString()
            //     ) {
            //       updatedRecentProducts.push(products[j]);
            //     }
            //   }
            // }
            // console.log("updated Recebt: ", updatedRecentProducts);
            // orders and products
            // for showing top reviweing products
            const sortedProdsReviews = products.sort(
              (a, b) => b.avgRating - a.avgRating
            );
            // console.log("output: ", output);
            console.log("review: ", updatedProducts.length);
            return res.render("shop/index", {
              path: "/",
              recentOrders: updatedRecentProducts,
              topProd: sortedProds,
              topReviewed: sortedProdsReviews,
              prods: products,
              cart: helpCart.cart,
              pageTitle: "Boi-Toi A online Book shop platform",
              categories: categories,
              isAuthenticated: req.session.isLoggedIn,
            });
          });
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.getCategories = (req, res, next) => {
  Category.find().then((categories) => {
    Product.find()
      .then((products) => {
        return res.render("shop/category-products", {
          pageTitle: "Categories | BoiToi",
          prods: products,
          categories: categories,
          path: "/categories",
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};
// =====================** Product Details ** ================
exports.getProduct = (req, res, next) => {
  const stringProdId = req.params.productId;
  // const prodId = mongoose.Types.ObjectId(stringProdId);
  const prodId = stringProdId;
  const page = +req.query.page || 1;
  let totalItems;

  Product.findById(prodId)
    .then((product) => {
      Review.find()
        .countDocuments()
        .then((numReviews) => {
          totalItems = numReviews;
          return Review.find({ productId: prodId })
            .skip((page - 1) * REVIEW_PER_PAGE)
            .limit(REVIEW_PER_PAGE);
        })
        // .then((prodReview) => {
        //   return Review.sortReview(prodReview, );
        // })
        .then((prodReview) => {
          console.log("prod ", prodReview, page, totalItems, REVIEW_PER_PAGE);
          res.render("shop/product-detail", {
            pageTitle: `${product.name} | BoiToi`,
            prod: product,
            prodReview: prodReview,
            currentPage: page,
            hasNextPage: REVIEW_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / REVIEW_PER_PAGE),
            path: "/products",
          });
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
      // console.log(err);
    });
};
// ==================== ** Cart Functionality ** ==============
exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      let total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });
      res.render("shop/cart", {
        pageTitle: "Cart",
        products: products,
        sum: total,
        path: "/cart",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    // .then((product) => {
    //   req.product = product;
    //   console.log("shop ", req.product);
    //   return req.product.addSellQuantity(product);
    // })
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartWithQty = (req, res, next) => {
  const prodId = req.body.productId;
  const quantity = parseInt(req.body.quantity);

  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCartWithQty(product, quantity);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteCartItem = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .removeItemFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// ==================== ** WishList Functionality ** =====================
exports.postWishlist = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then((product) => {
      return req.user.addToWishlist(product);
    })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.removeFromWhislist = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .removeFromWishlist(prodId)
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteWishlisttItem = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .clearWishList(prodId)
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// ========================= ** Review Functionality ** =====================
exports.reviewProduct = (req, res, next) => {
  const userName = req.body.name;
  const userEmail = req.body.email;
  const userReview = req.body.product_review;
  const starReview = parseInt(req.body.rating, 10);
  const prodId = req.body.productId;
  console.log(typeof starReview);

  Product.findById(req.body.productId)
    .then((product) => {
      req.product = product;

      return req.product.ratingStarFull(
        product,
        userName,
        userEmail,
        userReview,
        starReview
      );
    })
    .then((result) => {
      const review = new Review({
        productId: req.body.productId,
        name: userName,
        email: userEmail,
        review: userReview,
        rating: starReview,
      });
      return review.save();
    })
    .then((result) => {
      res.redirect("back");
    })
    .catch((err) => {
      console.log(err);
    });
};

// ======================== ** Order functionality ** ========================
exports.getCheckout = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      let total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });
      res.render("shop/checkout", {
        pageTitle: "checkout",
        product: products,
        sum: total,
        path: "/checkout",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  let total = 0;
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      user.cart.items.forEach((p) => {
        // console.log("order: ", p.productId, " ", p.productId.price);
        const prodid = p.productId._id;
        total += p.quantity * p.productId.price;
      });

      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });

      const order = new Order({
        products: products,
        user: {
          email: req.user.email,
          userId: req.user,
        },
        orderTime: moment().format("l, h:mm a"),
        orderStatus: "confirmed",
        payment_status: "PENDING",
      });
      return order.save();
    })
    .then((result) => {
      // product sellcount and copy updated....
      req.user.cart.items.forEach((p) => {
        const prodid = p.productId._id;
        Product.findById(prodid).then((prod) => {
          console.log("works: ", prod);
          req.product = prod;
          req.product.addSellQuantity(prod);
        });
      });
    })
    .then((result) => {
      // recent sold product schema updated
      req.user.cart.items.forEach((p) => {
        const prodid = p.productId._id;
        console.log("done");
        Product.findById(prodid).then((prod) => {
          const updatedList = new RecentProducts({
            product: prod,
          });
          updatedList.save();
        });
      });
    })
    // .then((result) => {
    //   // product sellcount and copy updated....
    //   req.user.cart.items.forEach((p) => {
    //     const prodid = p.productId._id;
    //     Product.findById(prodid).then((prod) => {
    //       console.log("works: ", prod);
    //       req.product = prod;
    //       req.product.addSellQuantity(prod);
    //     });
    //   });
    //   return req.user.clearCart();
    // })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrderStripe = (req, res, next) => {
  const token = req.body.stripeToken;
  let totalSum = 0;

  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      user.cart.items.forEach((p) => {
        totalSum += p.quantity * p.productId.price;
      });

      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
        orderTime: moment().format("l, h:mm a"),
        orderStatus: "confirmed",
        payment_status: "DONE",
      });
      return order.save();
    })
    .then((result) => {
      const charge = stripe.charges.create({
        amount: totalSum * 100,
        currency: "usd",
        description: "Demo Order",
        source: token,
        metadata: { order_id: result._id.toString() },
      });
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrder = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      let total = 0;

      res.render("shop/order", {
        pageTitle: "Orders",
        orders: orders,
        path: "/orders",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
// ======================= ** Product search functionality ** ==================
exports.getSearchResults = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  let searchedProduct = req.query.q;
  const category = req.query.category;
  const finalQuery = searchedProduct.toLowerCase();
  console.log("cat: ", category);

  if (category == "0") {
    // for all category
    Product.find({
      $or: [
        { category: { $regex: finalQuery } },
        { name: { $regex: finalQuery } },
      ],
    })
      .countDocuments()
      .then((numProds) => {
        totalItems = numProds;
        return Product.find({
          $or: [
            { category: { $regex: finalQuery } },
            { name: { $regex: finalQuery } },
          ],
        })
          .skip((page - 1) * 20)
          .limit(20);
      })

      .then((result) => {
        console.log("res ", result);
        console.log(result.length);
        return res.render("shop/product-search", {
          initalSearch: finalQuery,
          pageTitle: "Search Results",
          prods: result,
          currentPage: page,
          hasNextPage: 20 * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / 20),
          path: "/product-search",
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } // for specific category
  else {
    Product.find({
      $and: [
        { category: { $regex: category } },
        { name: { $regex: finalQuery } },
      ],
    })
      .countDocuments()
      .then((numProds) => {
        totalItems = numProds;
        return Product.find({
          $and: [
            { category: { $regex: category } },
            { name: { $regex: finalQuery } },
          ],
        })
          .skip((page - 1) * 20)
          .limit(20);
      })

      .then((result) => {
        console.log("res ", result);
        console.log(result.length);
        return res.render("shop/product-search", {
          initalSearch: finalQuery,
          pageTitle: "Search Results",
          prods: result,
          currentPage: page,
          hasNextPage: 20 * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / 20),
          path: "/product-search",
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

// ======================== ** Order invoice ** ================================
exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }
      // if (order.user.userId.toString() !== req.user._id.toString()) {
      //   return next(new Error("Unauthorized"));
      // }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });
      pdfDoc.text("-----------------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.name +
              " - " +
              prod.quantity +
              " x " +
              "$" +
              prod.product.price
          );
      });
      pdfDoc.text("---------");
      pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);

      pdfDoc.end();
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// ========================= ** USer DashBoard ** ===========================
exports.getDashboard = (req, res, next) => {
  switch (req.user.userType) {
    case "USER":
      res.render("user/dashboard", {
        pageTitle: "Dashboard | BoiToi",
        path: "/dashboard",
      });
      break;
    case "ADMIN":
      break;
    case "PUBLISHER":
      break;

    default:
      break;
  }
};
// ======================== *Order Tracker Functionality ** ==================
exports.getTrackInfo = (req, res, next) => {
  res.render("shop/track-order", {
    pageTitle: "Track Order | BoiToi",
    path: "/track",
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postTrack = (req, res, next) => {
  let prodId = req.body.track;
  prodId = mongoose.Types.ObjectId(prodId);

  Order.findById(prodId)
    .then((order) => {
      return res.render("shop/show-track", {
        pageTitle: "Order Status | BoiToi",
        path: "/track",
        order: order,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
