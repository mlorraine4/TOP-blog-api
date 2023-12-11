const asyncHandler = require("express-async-handler");
const Tags = require("../models/tags");
const BookReview = require("../models/bookReview");

exports.tag_list_get = asyncHandler(async (req, res, next) => {
  try {
    const tag = await Tags.findOne({ name: req.params.name });
    const reviews = await BookReview.find({
      tags: tag,
    })
      .populate("book")
      .exec();

    return res.render("tag-detail", {
      user: req.user,
      reviews: reviews,
    });
  } catch (err) {
    return next(err);
  }
});