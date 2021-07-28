const User = require("../models/user");

const Code = require("../models/auth-code");

const nodemailer = require("nodemailer");

const cryptoRandom = require("crypto-random-string");

const sparkPostTransport = require("nodemailer-sparkpost-transport");

const bcrypt = require("bcryptjs");

const { validationResult } = require("express-validator");
const crypto = require("crypto");

// ========================== ** nodemailer configuration setup ** ================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: `${process.env.USER}`, //sender mail
    pass: `${process.env.PASS}`, // sender mail password
  },
});

// =========================== **SignUp functionaility** =======================
exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    pageTitle: "BoiToi | SignUp",
    errorMessage: message,
    oldInput: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
    path: "/login",
  });
};

exports.postSignUp = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const mobile = req.body.mobile;
  const userType = req.body.userType;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "BoiToi | SignUp",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        name: name,
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
      path: "/Sign-Up",
    });
  }

  if (userType === "PUBLISHER") {
    res.render("auth/admin-auth/auth-pending", {
      pageTitle: "Verification | BoiToi",
    });
    return bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        crypto.randomBytes(32, (err, buffer) => {
          if (err) {
            console.log(err);
            return res.redirect("/");
          }
          const token = buffer.toString("hex");
          const pass = cryptoRandom({ length: 6 });
          const code = new Code({
            name: name,
            email: req.body.email,
            password: hashedPassword,
            mobile: mobile,
            pass: pass,
          });
          return code.save().then((d) => {
            Code.findOne({ email: req.body.email })
              .then((userDoc) => {
                if (!userDoc) {
                  req.flash("error", "No account with that email found.");
                  return res.redirect("/");
                }
                userDoc.resetToken = token;
                userDoc.resetTokenExpiration = Date.now() + 3600000;
                return userDoc.save();
              })
              .then((dat) => {
                const mailOptions = {
                  from: `"Dasbabu originals" ${process.env.USER}`, // sender address
                  to: email, // list of receivers
                  subject: " Verification Mail ", // Subject line
                  html: `
                 <p>You requested to sign up as a publisher. </p>
                 <p>Click this new <a href ="http://localhost:3001/verification/${token}">Link</a> and ${pass} to set a new password.</p>
                 `,
                };
                return transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    console.log(error);
                    // res.status(400).send({success: false})
                  } else {
                    // res.status(200).send({success: true});
                    console.log(info);
                  }
                });
              })
              .catch((err) => {
                console.log(err);
              });
          });
        });
      })

      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
        // console.log(err);
      });
  } else {
    return bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const user = new User({
          name: name,
          email: email,
          password: hashedPassword,
          Mobile_No: mobile,
          userType: "USER",
        });
        return user.save();
      })
      .then((result) => {
        res.redirect("/login");

        const mailOptions = {
          from: `"Dasbabu originals" ${process.env.USER}`, // sender address
          to: email, // list of receivers
          subject: "Welcome to Boi-Toi!! ", // Subject line
          html: "<h1>You successfully signed up. Welcome to Boi-Toi!</h1>",
        };
        return transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            // res.status(400).send({success: false})
          } else {
            // res.status(200).send({success: true});
            console.log(info);
          }
        });
      })

      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  }
};

// =+========================= ** Login Functionality** ========================

exports.getlogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    errorMessage: message,
    pageTitle: "BoiToi | Login",
    path: "/login",
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      errorMessage: errors.array()[0].msg,
      pageTitle: "Login | BoiToi",
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
      path: "/login",
    });
  }

  User.findOne({ email: email })
    .then((userDoc) => {
      if (!userDoc) {
        return res.status(422).render("auth/login", {
          errorMessage: "Invalid email or password.",
          pageTitle: "Login",
          oldInput: {
            email: email,
            password: password,
            confirmPassword: req.body.confirmPassword,
          },
          validationErrors: errors.array(),
          path: "/login",
        });
      }
      bcrypt
        .compare(password, userDoc.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = userDoc;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          req.flash("error", "Invalid email or password.");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(`the error is ${err}`);
    res.redirect("/");
  });
};

// =+========================= ** Reset password Functionality** ========================

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    errorMessage: message,
    pageTitle: "ResetPassword",
    path: "/reset",
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((userDoc) => {
        if (!userDoc) {
          req.flash("error", "No account with that email found.");
          return res.redirect("/reset");
        }
        userDoc.resetToken = token;
        userDoc.resetTokenExpiration = Date.now() + 3600000;
        return userDoc.save();
      })
      .then((result) => {
        res.redirect("/");

        const mailOptions = {
          from: `"Dasbabu originals" ${process.env.USER}`,
          to: req.body.email,
          subject: "Password reset ",
          html: `
          <p>You requested a password reset </p>
          <p>Click this new <a href ="http://localhost:3001/reset/${token}">Link</a> to set a new password.</p>
          `,
        };
        return transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log(info);
          }
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
        path: "/new-password",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt
        .hash(newPassword, 12)
        .then((hashedPassword) => {
          resetUser.password = hashedPassword;
          resetUser.resetToken = undefined;
          resetUser.resetTokenExpiration = undefined;
          return resetUser.save();
        })
        .then((result) => {
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
