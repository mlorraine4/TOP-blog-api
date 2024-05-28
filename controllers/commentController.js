const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Mongoose = require("mongoose");
const BookReview = require("../models/bookReview");
const WrapUp = require("../models/monthlyWrapUp");
const Comment = require("../models/comment");
const Book = require("../models/book");

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
      const month_format =
        req.params.month.substring(0, 1).toUpperCase() +
        req.params.month.substring(1);

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
          { month: month_format, year: req.params.year },
          { $push: { comments: comment } }
        ).exec();

        if (wrapUp !== null) {
          // Wrap up exists. Save comment.
          const result = await comment.save();
          return res.sendStatus(200);
        } else {
          // Wrap Up does not exist. Send error.
          return res.status(404).send({
            errors: [{ msg: "Can't save comment. Wrap Up does not exist." }],
          });
        }
      }
    } catch (err) {
      return res.status(500).send({
        errors: [{ msg: "There was an internal error saving your comment." }],
      });
    }
  }),
];

exports.wrap_up_comment_delete_post = asyncHandler(async (req, res, next) => {
  try {
    if (req.user) {
      if (Mongoose.Types.ObjectId.isValid(req.params.id)) {
        // Comment id provided is a valid mongoose id. Delete comment.
        const result = await Comment.findByIdAndDelete(req.params.id).exec();
        return res.sendStatus(200);
      } else {
        // Comment id provided is not a valid mongoose id
        return res.status(404).send({
          errors: [{ msg: "Comment does not exist." }],
        });
      }
    } else {
      // User is not logged in.
      return res.status(401).send({
        errors: [{ msg: "You must be an authorized user." }],
      });
    }
  } catch (err) {
    return res.status(500).send({
      errors: [{ msg: "There was an internal error saving your comment." }],
    });
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
      const errors = validationResult(req);

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

        const book = await Book.findOne({
          encodedAuthor: req.params.author,
          encodedTitle: req.params.title,
        }).exec();

        // Add comment to book review.
        const bookReview = await BookReview.findOneAndUpdate(
          { book: book },
          {
            $push: { comments: comment },
          }
        ).exec();

        if (bookReview !== null) {
          // Book review exists. Save comment.
          const result = await comment.save();
          return res.sendStatus(200);
        } else {
          // Book review does not exist. Send error.
          return res.status(404).send({
            errors: [
              { msg: "Can't save comment. Book review does not exist." },
            ],
          });
        }
      }
    } catch (err) {
      return res.status(500).send({
        errors: [{ msg: "There was an internal error saving your comment." }],
      });
    }
  }),
];

exports.book_review_comment_delete_post = asyncHandler(
  async (req, res, next) => {
    try {
      if (req.user) {
        if (Mongoose.Types.ObjectId.isValid(req.params.id)) {
          // Comment id provided is a valid mongoose id. Delete comment.
          const result = await Comment.findByIdAndDelete(req.params.id).exec();
          return res.sendStatus(200);
        } else {
          // Comment id provided is not a valid mongoose id
          return res.status(404).send({
            errors: [{ msg: "Comment does not exist." }],
          });
        }
      } else {
        return res.status(401).send({
          errors: [{ msg: "You must be an authorized user." }],
        });
      }
    } catch (err) {
      return res.status(500).send({
        errors: [{ msg: "There was an internal error saving your comment." }],
      });
    }
  }
);
