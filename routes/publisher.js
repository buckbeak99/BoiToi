const express = require("express");

const router = express.Router();

const isAuth = require("../middlewares/isAuth");

const { check, body } = require("express-validator/check");

const publisherController = require("../controllers/publisher");

router.get("/publisher/dashboard", publisherController.getDashboard);

router.get('/publisher/edit-profile', publisherController.getEditProfile);

router.post("/publisher/edit-profile", publisherController.postEditProfile);

module.exports = router;
