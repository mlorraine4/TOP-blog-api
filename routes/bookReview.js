var express = require("express");
var router = express.Router();

const bookReviewController = require("../controllers/bookReviewController");
const commentController = require("../controllers/commentController");

// Get list of book reviews
router.get("/", bookReviewController.book_review_list_get);
// Get book review form for specific book
router.get(
  "/:author/:title/add",
  bookReviewController.book_specified_review_form_get
);
// Post book review form
router.post("/:author/:title/add", bookReviewController.book_review_form_post);
// Get book review form
router.get("/add", bookReviewController.book_review_form_get);
// Post book review form
router.post("/add", bookReviewController.book_review_form_post);
// Get book review detail
router.get("/:author/:title", bookReviewController.book_review_detail_get);
// Get book review update form
router.get(
  "/:author/:title/update",
  bookReviewController.book_review_update_get
);
// Post book review update
router.post(
  "/:author/:title/update",
  bookReviewController.book_review_update_post
);
// Get book review delete form
router.get(
  "/:author/:title/delete",
  bookReviewController.book_review_delete_get
);
// Post delete book review
router.post(
  "/:author/:title/delete",
  bookReviewController.book_review_delete_post
);
// Post comment for book review
router.post(
  "/:author/:title/comments",
  commentController.book_review_comment_form_post
);
// Post delete comment for book review
router.post(
  "/:author/:title/comments/:id",
  commentController.book_review_comment_delete_post
);

module.exports = router;
