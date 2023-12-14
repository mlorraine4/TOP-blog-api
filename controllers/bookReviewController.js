const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const BookReview = require("../models/bookReview");
const Book = require("../models/book");
const Tags = require("../models/tags");
const mongoose = require("mongoose");
const Comment = require("../models/comment");

exports.post_list_get = asyncHandler(async (req, res, next) => {
  try {
    const aggregate = BookReview.aggregate([
      {
        $group: {
          _id: "$_id",
          book: { $first: "$book" },
          timestamp: { $first: "$timestamp" },
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "book",
          foreignField: "_id",
          as: "book",
        },
      },
      {
        $unwind: "$book",
      },
    ]);

    const result = await aggregate
      .unionWith({
        coll: "monthlywrapups",
        pipeline: [{ $project: { _id: 0 } }],
      })
      .sort({ timestamp: -1 })
      .exec();

    return res.render("index", { posts: result, user: req.user });
  } catch (err) {
    return next(err);
  }
});

exports.book_review_list_get = asyncHandler(async (req, res, next) => {
  try {
    const bookReviews = await BookReview.find().populate("book").exec();
    return res.render("book-review-list", {
      user: req.user,
      reviews: bookReviews,
    });
  } catch (err) {
    return next(err);
  }
});

exports.book_review_detail_get = asyncHandler(async (req, res, next) => {
  try {
    const book = await Book.findOne({
      encodedTitle: req.params.title,
      encodedAuthor: req.params.author,
    }).exec();

    const review = await BookReview.findOne({ book: book })
      .populate("book")
      .populate("tags")
      .populate({ path: "comments", options: { sort: { timestamp: -1 } } })
      .exec();

    if (review !== null) {
      // Review exists.
      return res.render("book-review-detail", {
        review: review,
        user: req.user,
      });
    } else {
      // No results.
      const err = new Error("Review does not exist.");
      err.status = 404;
      return next(err);
    }
  } catch (err) {
    return next(err);
  }
});

exports.book_review_form_get = asyncHandler(async (req, res, next) => {
  // if (req.user) {
  return res.render("book-review-form", { user: req.user });
  // } else {
  //   // User is not logged in.
  //   const err = new Error("You must be an authorized user.");
  //   err.status = 401;
  //   return next(err);
  // }
});

exports.book_review_form_post = [
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("review", "Review must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("tags").trim().escape(),
  asyncHandler(async (req, res, next) => {
    try {
      if (req.user) {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // There are errors.
        return res.status(400).send({ errors: errors.array() });
      } else {
        // Form data is valid.
        const book = await Book.findOne({
          title: req.body.title,
          author: req.body.author,
        }).exec();

        const existing_review = await BookReview.findOne({ book: book });

        if (book !== null && existing_review === null) {
          // Book exists and there is not a review yet.
          let tagsDBArr = [];
          for (const tag of req.body.tags) {
            // Save tags.
            const tagRes = await Tags.findOne({ name: tag }).exec();
            if (tagRes !== null) {
              // Tag exists, add to array.
              tagsDBArr.push(tagRes);
            } else {
              // Tag does not exist, save to db.
              const tagData = new Tags({
                name: tag,
              });
              const result = await tagData.save();
              tagsDBArr.push(tagData);
            }
          }

          const book_review = new BookReview({
            title: req.body.title,
            body: req.body.review,
            book: book,
            tags: tagsDBArr,
            timestamp: Date.now(),
          });

          // Save book review.
          const result = await book_review.save();
          return res.status(200).send({ url: book_review.url });
        } else if (book === null) {
          // Book does not exist yet. Send error.
          return res.status(400).send({
            errors: [
              {
                msg: `You need to add book: ${req.body.title} by ${req.body.author} before saving review.`,
              },
            ],
          });
        } else {
          // There is already a review.
          return res.status(409).send({
            errors: [
              {
                msg: `A review for ${req.body.title} by ${req.body.author} already exists.`,
              },
            ],
          });
        }
      }
      } else {
        // User is not logged in.
        return res
      .status(401)
      .send({ errors: [{ msg: "You must be an authorized user." }] });
      }
    } catch (err) {
      return res.status(500).send({ errors: err });
    }
  }),
];

exports.book_review_update_get = asyncHandler(async (req, res, next) => {
  try {
    // if (req.user) {
    const book = await Book.findOne({
      encodedTitle: req.params.title,
      encodedAuthor: req.params.author,
    }).exec();

    const bookReview = await BookReview.findOne({ book: book })
      .populate("book")
      .populate("tags")
      .exec();

    if (bookReview !== null) {
      // Book review exists.
      return res.render("book-review-form", {
        user: req.user,
        title: "Edit Book Review",
        bookReview: bookReview,
      });
    } else {
      // No results.
      const err = new Error("Book Review does not exist.");
      err.status = 404;
      return next(err);
    }
    // } else {
    //   // User is not logged in.
    //   const err = new Error("You must be an authorized user.");
    //   err.status = 401;
    //   return next(err);
    // }
  } catch (err) {
    return next(err);
  }
});

exports.book_review_update_post = [
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("review", "Review must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("tags").trim().escape(),
  asyncHandler(async (req, res, next) => {
    try {
      if (req.user) {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // Form data is not valid.
        return res.status(400).send({ errors: errors.array() });
      } else {
        // Form data is valid. Update book review.
        const book = await Book.findOne({
          encodedTitle: req.params.title,
          encodedAuthor: req.params.author,
        }).exec();

        const bookReview = await BookReview.findOne({ book: book })
          .populate("book")
          .exec();

        if (bookReview !== null) {
          // Book review exists. Save all tags.
          let tagsDBArr = [];
          for (const tag of req.body.tags) {
            const tagRes = await Tags.findOne({ name: tag }).exec();
            if (tagRes !== null) {
              // Tag exists, add to array.
              tagsDBArr.push(tagRes);
            } else {
              // Tag does not exist, save to db.
              const tagData = new Tags({
                name: tag,
              });
              const result = await tagData.save();
              tagsDBArr.push(tagData);
            }
          }

          const newBookReview = new BookReview({
            body: req.body.review,
            book: bookReview.book,
            tags: tagsDBArr,
            timestamp: bookReview.timestamp,
            _id: bookReview._id,
          });

          await BookReview.findByIdAndUpdate(
            bookReview._id,
            newBookReview,
            {}
          );
          return res.status(200).send({ url: bookReview.url });
        } else {
          // No results.
          return res.status(404).send({
            errors: [{ msg: "Book review does not exist." }],
          });
        }
      }
      } else {
        // User is not logged in.
        return res
      .status(401)
      .send({ errors: [{ msg: "You must be an authorized user." }] });
      }
    } catch (err) {
      return res.status(500).send({ errors: err });
    }
  }),
];

exports.book_review_delete_get = asyncHandler(async (req, res, next) => {
  try {
    if (req.user) {
      const book = await Book.findOne({
        encodedTitle: req.params.title,
        encodedAuthor: req.params.author,
      }).exec();

      const bookReview = await BookReview.findOne({ book: book })
        .populate("book")
        .populate("tags")
        .exec();

      if (bookReview !== null) {
        // Book review exists.
        return res.render("book-review-delete", {
          user: req.user,
          book_review: bookReview,
        });
      } else {
        // No results.
        const err = new Error("Book review does not exist.");
        err.status = 404;
        return next(err);
      }
    } else {
      // User is not logged in.
      const err = new Error("You must be an authorized user.");
      err.status = 401;
      return next(err);
    }
  } catch (err) {
    return next(err);
  }
});

exports.book_review_delete_post = asyncHandler(async (req, res, next) => {
  try {
    if (req.user) {
      const book = await Book.findOne({
        encodedTitle: req.params.title,
        encodedAuthor: req.params.author,
      }).exec();

      await BookReview.findOneAndDelete({ book: book }).exec();
      return res.redirect("/gardenofpages/book-reviews");
    } else {
      // User is not logged in.
      const err = new Error("You must be an authorized user.");
      err.status = 401;
      return next(err);
    }
  } catch (err) {
    return next(err);
  }
});
