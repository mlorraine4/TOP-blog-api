const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const BookReview = require("../models/bookReview");
const WrapUp = require("../models/monthlyWrapUp");
const Comment = require("../models/comment");

exports.wrap_up_comment_form_post = [
  asyncHandler(async (req, res, next) => {
    try {

      console.log(req.body);

      const comment = new Comment({
        name: req.body.name,
        text: req.body.text,
        timestamp: req.body.timestamp,
      });

      const wrapUp = await WrapUp.findOneAndUpdate(
        { month: req.params.month, year: req.params.year },
        { $push: { comments: comment } }, 
      ).exec();

      const result = await comment.save();

      return res.status(200).send();
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }),
];

exports.wrap_up_comment_delete_post = asyncHandler(async (req, res, next) => {

  if (req.user) {
    try {
      const result = await Comment.findByIdAndDelete(req.params.id).exec();
      console.log(result);
      if (result !== null) {
        return res.status(200).send();
      } else {
        return res.status(404).send();
      }
    } catch (err) {
      return next(err);
    }
  }
  
});

exports.book_review_comment_form_post = [
  asyncHandler(async (req, res, next) => {
    try {

      const comment = new Comment({
        name: req.body.name,
        text: req.body.text,
        timestamp: req.body.timestamp,
      });

      const bookReview = await BookReview.findByIdAndUpdate(
        req.params.id,
        { $push: { comments: comment } }
      ).exec();

      const result = await comment.save();

      return res.status(200).send();
    } catch (err) {
      return next(err);
    }
  }),
];

exports.book_review_comment_delete_post = asyncHandler(async (req, res, next) => {
  if (req.user) {
    try {
      console.log(req.params);
      const result = await Comment.findByIdAndDelete(req.params.commentid).exec();
      console.log(result);
      if (result !== null) {
        return res.status(200).send();
      } else {
        return res.status(404).send();
      }
    } catch (err) {
      return next(err);
    }
  }
});