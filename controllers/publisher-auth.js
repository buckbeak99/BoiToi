const User = require("../models/user");

const Code = require("../models/auth-code");

const nodemailer = require("nodemailer");

const cryptoRandom = require("crypto-random-string");

const sparkPostTransport = require("nodemailer-sparkpost-transport");

const bcrypt = require("bcryptjs");

const { validationResult } = require("express-validator");
const crypto = require("crypto");

const SparkPost = require("sparkpost");

const client = new SparkPost("730cb909d8c95861b463bc2faf3c8932db9bb253");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "dasbabuoriginals@gmail.com",
    pass: `${process.env.PASS}`,
  },
});

exports.getAdminSignUp = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/admin-auth/signup", {
    pageTitle: "Publisher SignUp | BoiToi ",
    errorMessage: message,
    oldInput: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      Mobile_No: "",
    },
    validationErrors: [],
  });
};

exports.postSignUp = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const mobile = req.body.mobile;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "BoiToi | SignUp",
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      oldInput: {
        name: name,
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
    });
  }
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
        const pass = cryptoRandom({ length: 10 });
        const code = new Code({
          name: name,
          email: req.body.email,
          password: hashedPassword,
          mobile: req.body.mobile,
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
                from: '"Dasbabu originals" dasbabuoriginals@gmail.com', // sender address
                to: email, // list of receivers
                subject: " Verification Mail ", // Subject line
                html: `
                 <p>You requested a password reset </p>
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
};

exports.getCode = (req, res, next) => {
  const token = req.params.token;
  Code.findOne({
    token: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/admin-auth/auth-code", {
        pageTitle: "Verification | BoiToi",
        errorMessage: message,
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCode = (req, res, next) => {
  const code = req.body.code;
  const passwordToken = req.body.passwordToken;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/admin-auth/auth-pending", {
      pageTitle: "Verification | BoiToi",
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Code.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((userData) => {
      userData.resetToken = undefined;
      userData.resetTokenExpiration = undefined;
      return userData.save().then((da) => {
        const user = new User({
          name: da.name,
          email: da.email,
          password: da.password,
          Mobile_No: da.mobile,
          userType: "PUBLISHER",
        });
        console.log(da.mobile);
        user.save();
        Code.deleteOne({ email: da.email })
          .then((re) => {
            res.redirect("/login");
            const mailOptions = {
              from: '"Dasbabu originals" dasbabuoriginals@gmail.com', // sender address
              to: da.email, // list of receivers
              subject: " Welcome to BoiToi!! ", // Subject line
              html: `
             <p>You signed up sucessfully as a Publisher </p>
             
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
    })
    .catch((err) => {
      console.log(err);
    });
};
