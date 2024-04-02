const asyncHandler = require("express-async-handler");
const Tags = require("../models/tags");
const BookReview = require("../models/bookReview");
const Book = require("../models/book");

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

exports.search_post = asyncHandler(async (req, res, next) => {
  try {
    const query = "/s?q=" + req.body.search;
    return res.redirect(query);
  } catch (err) {
    return next(err);
  }
});

exports.search_get = asyncHandler(async (req, res, next) => {
  try {
    const tags = await Tags.find({
      $text: {
        $search: req.query.q,
      },
    }).exec();

    const books = await Book.find({
      $text: {
        $search: req.query.q,
      },
    });

    const reviews = await BookReview.find({
      $or: [{ tags: { $in: tags } }, { book: { $in: books } }],
    })
      .populate("book")
      .exec();
    res.render("search", { reviews: reviews });
  } catch (err) {
    return next(err);
  }
});
