var express = require("express");
var router = express.Router();

const siteController = require("../controllers/siteController");
const wrapUpController = require("../controllers/wrapUpController");
const bookReviewController = require("../controllers/bookReviewController");
const tagController = require("../controllers/tagController");
const commentController = require("../controllers/commentController");

// Get home page
router.get("/", siteController.home_get);
router.get("/page/:pageNumber", siteController.home_get);
// Get log in
router.get("/log-in", siteController.log_in_GET);
// Post log in
router.post("/log-in", siteController.log_in_POST);
// Get log out
router.get("/log-out", siteController.log_out_GET);
// // Get sign up
// router.get("/sign-up", siteController.sign_up_get);
// // Post sign up
// router.post("/sign-up", siteController.sign_up_post);
// Get upcoming releases calendar
router.get("/upcoming-releases", siteController.calendar_get);
// Get profile
// TODO: write profile
router.get("/author/maria", siteController.profile_get);

/// TAGS
// Get tag detail
router.get("/tags/:name", tagController.tag_detail_get);

/// SEARCH
router.post("/search", tagController.search_post);
router.get("/s", tagController.search_get);

// GENERAL POSTS
// path --> /year/month/day/title

module.exports = router;
