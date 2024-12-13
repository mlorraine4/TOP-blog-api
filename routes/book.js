var express = require("express");
var router = express.Router();

const bookController = require("../controllers/bookController");

// Get list of all books
router.get("/", bookController.book_list_get);
// Get new book form
router.get("/add", bookController.book_form_get);
// Post new book form
router.post("/add", bookController.book_form_post);
// Get book detail
router.get("/:author/:title/", bookController.book_detail_get);
// TODO: change form get to work with update (get and post)
// Get update book form
router.get("/:author/:title/update", bookController.book_update_get);
// Post update book form
router.post("/:author/:title/update", bookController.book_update_post);
// Get book delete
router.get("/:author/:title/delete", bookController.book_delete_get);
// Post book delete
router.post("/:author/:title/delete", bookController.book_delete_post);

module.exports = router;
