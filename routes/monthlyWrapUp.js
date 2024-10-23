var express = require("express");
var router = express.Router();

const wrapUpController = require("../controllers/wrapUpController");
const commentController = require("../controllers/commentController");

// Get list of all monthly wrap ups
router.get("/", wrapUpController.wrapUp_list_get);
// Get add wrap up form
router.get("/add", wrapUpController.wrapUp_form_get);
// Post add wrap up
router.post("/add", wrapUpController.wrapUp_form_post);
// Get wrap up list by year
router.get("/:year", wrapUpController.wrapUp_yearly_list_get);
// Get monthly wrap up detail
router.get("/:year/:month", wrapUpController.wrapUp_detail_get);
// Get update form
router.get("/:year/:month/update", wrapUpController.wrapUp_form_get);
// Post update
router.post("/:year/:month/update", wrapUpController.wrapUp_update_post);
// Post comment for specific wrap up
router.post(
  "/:year/:month/comments",
  commentController.wrap_up_comment_form_post
);
// Delete comment for specific wrap up
router.post(
  "/:year/:month/comments/:id/delete",
  commentController.wrap_up_comment_delete_post
);

module.exports = router;
