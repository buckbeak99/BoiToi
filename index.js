const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const csrf = require("csurf");
const flash = require("connect-flash");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const User = require("./models/user");
const multer = require("multer");
const URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-jnxxe.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;
const Category = require("./models/category");
const errorController = require("./controllers/error");

const port = 3001;

const app = express();

const store = new MongoDBStore({
  uri: URI,
  collection: "sessions",
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");
const isAuth = require("./middlewares/isAuth");
const shopRoute = require("./routes/shop");
const authRoute = require("./routes/auth");
const adminRoute = require("./routes/admin");
const publisherAuthRoute = require("./routes/publisher-auth");
const shopController = require("./controllers/shop");
const userRoute = require("./routes/user");
const publisherRoute = require("./routes/publisher");
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("Myimage")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.url = req.originalUrl;
  res.locals.host = req.get("host");
  res.locals.protocol = req.protocol;
  next();
});

app.use((req, res, next) => {
  Category.find()
    .then((categories) => {
      res.locals.categories = categories;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.post("/create-order-stripe", isAuth, shopController.postOrderStripe);
app.use(csrfProtection);

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  if (req.session.user) {
    res.locals.user = req.user;
  }

  next();
});

app.use("/admin", adminRoute);
app.use(shopRoute);
app.use(authRoute);
app.use(publisherAuthRoute);
app.use(userRoute);
app.use(publisherRoute);

app.get("/500", errorController.get500);

app.use(errorController.get404);

mongoose
  .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(process.env.PORT || port, () => {
      console.log(`listening to server at port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
