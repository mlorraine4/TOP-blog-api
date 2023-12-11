const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const BookReview = require("../models/bookReview");
const WrapUp = require("../models/monthlyWrapUp");
const Comment = require("../models/comment");

exports.wrap_up_comment_form_post = [
  body("name", "Name field needs to be shorter than 20 characters")
    .optional()
    .trim()
    .isLength({ min: 0, max: 20 })
    .escape(),
  body("text", "Comment field is required")
    .trim()
    .isLength({ min: 1, max: 250 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // Form data is not valid. Send error(s).
        return res.status(400).send({ errors: errors.array() });
      } else {
        // Data is valid. Save comment, add comment to Wrap Up.
        const comment = new Comment({
          name: req.body.name,
          text: req.body.text,
          timestamp: req.body.timestamp,
        });

        const wrapUp = await WrapUp.findOneAndUpdate(
          { month: req.params.month, year: req.params.year },
          { $push: { comments: comment } }
        ).exec();

        const result = await comment.save();

        return res.sendStatus(200);
      }
    } catch (err) {
      return next(err);
    }
  }),
];

exports.wrap_up_comment_delete_post = asyncHandler(async (req, res, next) => {
  if (req.user) {
    try {
      const result = await Comment.findByIdAndDelete(req.params.id).exec();

      if (result !== null) {
        // Comment found and deleted.
        return res.sendStatus(200);
      } else {
        // Result not found.
        return res.sendStatus(404);
      }
    } catch (err) {
      return next(err);
    }
  } else {
    const err = new Error("You must be an authorized user.");
    err.status = 401;
    return next(err);
  }
});

exports.book_review_comment_form_post = [
  body("name", "Name field needs to be shorter than 20 characters")
    .optional()
    .trim()
    .isLength({ min: 0, max: 20 })
    .escape(),
  body("text", "Comment field is required")
    .trim()
    .isLength({ min: 1, max: 250 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    try {
      if (!errors.isEmpty()) {
        // Form data is not valid. Send error(s).
        return res.status(500).send({ errors: errors.array() });
      } else {
        // Form data is valid.
        const comment = new Comment({
          name: req.body.name,
          text: req.body.text,
          timestamp: req.body.timestamp,
        });

        // Add comment to book review.
        const bookReview = await BookReview.findByIdAndUpdate(req.params.id, {
          $push: { comments: comment },
        }).exec();

        // Save comment.
        const result = await comment.save();

        return res.sendStatus(200);
      }
    } catch (err) {
      return next(err);
    }
  }),
];

exports.book_review_comment_delete_post = asyncHandler(
  async (req, res, next) => {
    if (req.user) {
      try {

        const result = await Comment.findByIdAndDelete(
          req.params.commentid
        ).exec();

        if (result !== null) {
          return res.sendStatus(200);
        } else {
          return res.sendStatus(404);
        }
      } catch (err) {
        return next(err);
      }
    } else {
      const err = new Error("You must be an authorized user.");
      err.status = 401;
      return next(err);
    }
  }
);