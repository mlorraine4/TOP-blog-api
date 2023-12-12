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

    const review = await BookReview.findOne({book: book})
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
  if (req.user) {
    return res.render("book-review-form", { user: req.user });
  } else {
    // User is not logged in.
    const err = new Error("You must be an authorized user.");
    err.status = 401;
    return next(err);
  }
});

exports.book_review_form_post = [
  body("review_body", "Review must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("tag_input", "Tags must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    try {
      if (req.user) {
        const errors = validationResult(req);
        const book = await Book.findOne({
          title: req.body.title,
          author: req.body.author,
        }).exec();

        const existing_review = await BookReview.findOne({ book: book });

        if (book !== null) {
          if (existing_review === null) {
            // Book exists and there is not already a review for it.
            let tagsDBArr = [];

            if (req.body.tag_input.length > 0) {
              if (req.body.tag_input.includes(",")) {
                // There are multiple tags.
                const tagsReqArr = req.body.tag_input.split(",");
                for (const tag of tagsReqArr) {
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
              } else {
                // There is a single tag.
                const result = await Tags.findOne({
                  name: req.body.tag_input,
                }).exec();
                if (result === null) {
                  // Tag does not exist, save to db.
                  const newTag = new Tags({
                    name: req.body.tag_input,
                  });

                  const tagRes = await newTag.save();
                  tagsDBArr.push(tagRes);
                } else {
                  // Tag exists, save to array.
                  tagsDBArr.push(result);
                }
              }
            }

            const book_review = new BookReview({
              title: req.body.title,
              body: req.body.review_body,
              book: book,
              tags: tagsDBArr,
              timestamp: Date.now(),
            });

            if (!errors.isEmpty()) {
              // There are errors. Re-render form with errors.
              return res.render("book-review-form", {
                user: req.user,
                title: "Add Review",
                bookReview: book_review,
                errors: errors.array(),
              });
            } else {
              // Data is valid. Save book review.
              const result = await book_review.save();
              return res.redirect(result.url);
            }
          } else {
            // Book review already exists.
            const err = new Error("Book already has review.");
            err.status = 409;
            return next(err);
          }
        } else {
          // Book does not exist yet. Re-render form with error.
          const err = new Error("You need to add the associated book before submitting a review.");
          err.status = 400;
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
  }),
];

exports.book_review_update_get = asyncHandler(async (req, res, next) => {
  try {
    if (req.user) {
        const book = await Book.findOne({
          encodedTitle: req.params.title,
          encodedAuthor: req.params.author,
        }).exec();

        const bookReview = await BookReview.findOne({book: book})
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

exports.book_review_update_post = [
  body("review_body", "Review must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("tag_input", "Tags must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    try {
      if (req.user) {
        const errors = validationResult(req);

        const book = await Book.findOne({
          encodedTitle: req.params.title,
          encodedAuthor: req.params.author,
        }).exec();

        const bookReview = await BookReview.findOne({ book: book })
          .populate("book")
          .populate("tags")
          .exec();

        if (bookReview !== null) {
          let tagsDBArr = [];

          if (req.body.tag_input.includes(",")) {
            // There are multiple tags.
            const tagsReqArr = req.body.tag_input.split(",");
            for (const tag of tagsReqArr) {
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
          } else {
            // There is a single tag.
            const result = await Tags.findOne({
              name: req.body.tag_input,
            }).exec();
            if (result !== null) {
              // Tag does not exist, save to db.
              const newTag = new Tags({
                name: req.body.tag_input,
              });

              const tagRes = await newTag.save();
              tagsDBArr.push(tagRes);
            } else {
              // Tag exists, save to array.
              tagsDBArr.push(result);
            }
          }

          const newBookReview = new BookReview({
            title: req.body.title,
            body: req.body.review_body,
            book: bookReview.book,
            tags: tagsDBArr,
            timestamp: bookReview.timestamp,
            _id: req.params.id,
          });

          if (!errors.isEmpty()) {
            // Form data is not valid. Re-render with errors.
            return res.render("book-review-form", {
              user: req.user,
              title: "Edit Review",
              bookReview: newBookReview,
              errors: errors.array(),
            });
          } else {
            // Form data is valid. Update book review.
            const updatedBookReview = await BookReview.findByIdAndUpdate(
              req.params.id,
              newBookReview,
              {}
            );
            return res.redirect(updatedBookReview.url);
          }
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
      
      await BookReview.findOneAndDelete({book: book}).exec();
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
