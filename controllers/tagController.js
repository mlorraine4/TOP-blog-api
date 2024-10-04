const asyncHandler = require("express-async-handler");
const Tag = require("../models/tag");
const BookReview = require("../models/bookReview");
const Book = require("../models/book");

exports.tag_detail_get = asyncHandler(async (req, res, next) => {
  try {
    const tag = await Tag.findOne({ name: req.params.name });
    const reviews = await BookReview.find({
      tags: tag,
    })
      .populate("book")
      .exec();
    let title = "No Results - Garden of Pages";

    if (tag !== null) {
      title = `${tag.name} - Garden of Pages`;
    }

    return res.render("tag-detail", {
      title: title,
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
    const tags = await Tag.find({
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

    let title = "No Results - Garden of Pages";

    if (reviews.length !== 0) {
      title = `${req.query.q} - Garden of Pages`;
    }

    res.render("search", {
      title: title,
      reviews: reviews,
    });
  } catch (err) {
    return next(err);
  }
});
