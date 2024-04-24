var express = require("express");
var router = express.Router();

// TODO: add form required for all inputs
// TODO: draw new header, imgs for months
// TODO: remove proxy in json package, only for development

const wrapUpController = require("../controllers/wrapUpController");
const userController = require("../controllers/userController");
const bookController = require("../controllers/bookController");
const bookReviewController = require("../controllers/bookReviewController");
const tagController = require("../controllers/tagController");
const commentController = require("../controllers/commentController");

/// USERS
router.get("/log-in", userController.log_in_GET);
router.post("/log-in", userController.log_in_POST);
router.get("/log-out", userController.log_out_GET);
// router.get("/sign-up", userController.sign_up_get);
// router.post("/sign-up", userController.sign_up_post);
router.get("/upcoming-releases", userController.calendar_get);
router.get("/dashboard", userController.user_dashboard_get);
router.get("/account", userController.user_account_get);

/// MONTHLY WRAP UP
router.get("/monthly-wrap-ups", wrapUpController.wrapUp_list_get);
router.get("/new-monthly-wrap-up", wrapUpController.wrapUp_form_get);
router.post("/new-monthly-wrap-up", wrapUpController.wrapUp_form_post);
router.get("/monthly-wrap-up/:year", wrapUpController.wrapUp_yearly_list_get);
router.get("/monthly-wrap-up/:year/:month", wrapUpController.wrapUp_detail_get);
router.get(
  "/monthly-wrap-up/:year/:month/update",
  wrapUpController.wrapUp_update_get
);
router.post(
  "/monthly-wrap-up/:year/:month/update",
  wrapUpController.wrapUp_update_post
);
// Comments
router.post(
  "/monthly-wrap-up/:year/:month/new-comment",
  commentController.wrap_up_comment_form_post
);
router.post(
  "/monthly-wrap-up/:year/:month/comment/:id/delete",
  commentController.wrap_up_comment_delete_post
);

/// BOOK
router.get("/library", bookController.book_list_get);
router.get("/new-book", bookController.book_form_get);
router.post("/new-book", bookController.book_form_post);
router.get("/book/:author/:title/", bookController.book_detail_get);
router.get("/book/:author/:title/update", bookController.book_update_get);
router.post("/book/:author/:title/update", bookController.book_update_post);
router.get("/book/:author/:title/delete", bookController.book_delete_get);
router.post("/book/:author/:title/delete", bookController.book_delete_post);

/// BOOK REVIEW
// Home page get.
router.get("/", bookReviewController.home_get);
router.post("/posts", bookReviewController.post_list);
router.get("/book-reviews", bookReviewController.book_review_list_get);
router.get("/new-book-review", bookReviewController.book_review_form_get);
router.post("/new-book-review", bookReviewController.book_review_form_post);
router.get(
  "/book-review/:author/:title/",
  bookReviewController.book_review_detail_get
);
router.get(
  "/book-review/:author/:title/update",
  bookReviewController.book_review_update_get
);
router.post(
  "/book-review/:author/:title/update",
  bookReviewController.book_review_update_post
);
router.get(
  "/book-review/:author/:title/delete",
  bookReviewController.book_review_delete_get
);
router.post(
  "/book-review/:author/:title/delete",
  bookReviewController.book_review_delete_post
);

// Comments
router.post(
  "/book-review/:author/:title/new-comment",
  commentController.book_review_comment_form_post
);
router.post(
  "/book-review/:author/:title/comment/:id/delete",
  commentController.book_review_comment_delete_post
);

/// TAGS
router.get("/tags/:name", tagController.tag_detail_get);

/// SEARCH
router.post("/search", tagController.search_post);
router.get("/s", tagController.search_get);

module.exports = router;
