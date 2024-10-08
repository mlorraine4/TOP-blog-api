const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const BookReview = require("../models/bookReview");
const Book = require("../models/book");
const Tags = require("../models/tag");

exports.book_review_list_get = asyncHandler(async (req, res, next) => {
  try {
    const bookReviews = await BookReview.find()
      .sort({ timestamp: -1 })
      .populate("book")
      .exec();
    return res.render("book-review-list", {
      title: "Book Reviews - Garden of Pages",
      user: req.user,
      bookReviews: bookReviews,
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
        title: `Review: ${book.title} - Garden of Pages`,
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
    return res.render("book-review-form", {
      title: "Add Book Review - Garden of Pages",
      header: "Add Review",
      user: req.user,
    });
  } else {
    // User is not logged in.
    const err = new Error("You must be an authorized user.");
    err.status = 401;
    return next(err);
  }
});

exports.book_specified_review_form_get = asyncHandler(
  async (req, res, next) => {
    if (req.user) {
      try {
        const book = await Book.findOne({
          encodedTitle: req.params.title,
          encodedAuthor: req.params.author,
        }).exec();

        return res.render("book-review-form", {
          title: "Add Book Review - Garden of Pages",
          header: "Add Review",
          user: req.user,
          book: book,
        });
      } catch (err) {
        console.log(err);
        return next(err);
      }
    } else {
      // User is not logged in.
      const err = new Error("You must be an authorized user.");
      err.status = 401;
      return next(err);
    }
  }
);

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
      if (!req.user) {
        // User is not logged in.
        return res
          .status(401)
          .send([{ msg: "You must be an authorized user." }]);
      }

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // Form data has errors.
        return res.status(400).send(errors.array());
      }

      // Check if book exists
      const book = await Book.findOne({
        title: req.body.title,
        author: req.body.author,
      }).exec();

      if (book === null) {
        // Book does not exist yet. Send error.
        return res.status(404).send([
          {
            msg: `You need to add book: ${req.body.title} by ${req.body.author} before saving review.`,
          },
        ]);
      }

      // Check if review already exists
      const existingReview = await BookReview.findOne({ book: book });
      if (existingReview !== null) {
        // There is already a review. Send error.
        return res.status(409).send([
          {
            msg: `A review for ${req.body.title} by ${req.body.author} already exists.`,
          },
        ]);
      }

      // Save tags
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
          await tagData.save();
          tagsDBArr.push(tagData);
        }
      }

      // Create review.
      const bookReview = new BookReview({
        title: `A Review of ${book.title} by ${book.author}`,
        review: req.body.review,
        book: book,
        tags: tagsDBArr,
        timestamp: Date.now(),
      });

      // Save book review.
      await bookReview.save();
      return res.status(200).send({ url: book.reviewUrl });
    } catch (err) {
      console.log(err);
      return res.status(500).send([{ msg: "An internal error occurred" }]);
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

      const bookReview = await BookReview.findOne({ book: book })
        .populate("tags")
        .exec();

      if (bookReview === null) {
        // No results.
        const err = new Error("Book Review does not exist.");
        err.status = 404;
        return next(err);
      }

      return res.render("book-review-form", {
        title: "Update Review - Garden of Pages",
        header: "Update Review",
        user: req.user,
        title: "Edit Book Review",
        bookReview: bookReview,
        book: book,
      });
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
      if (!req.user) {
        // User is not logged in.
        return res
          .status(401)
          .send([{ msg: "You must be an authorized user." }]);
      }

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // Form data is not valid.
        return res.status(400).send(errors.array());
      }

      // Find associated book
      const book = await Book.findOne({
        encodedTitle: req.params.title,
        encodedAuthor: req.params.author,
      }).exec();

      // Get book review
      const bookReview = await BookReview.findOne({ book: book })
        .populate("book")
        .exec();

      if (bookReview === null) {
        // No results.
        return res.status(404).send([{ msg: "Book review does not exist." }]);
      }

      // Save tags
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

      // Create new book review (keeps original timestamp)
      const updatedBookReview = new BookReview({
        review: req.body.review,
        book: bookReview.book,
        tags: tagsDBArr,
        timestamp: bookReview.timestamp,
        _id: bookReview._id,
      });

      // Update existing review
      await BookReview.findByIdAndUpdate(bookReview._id, updatedBookReview, {});
      return res.status(200).send({ url: book.reviewUrl });
    } catch (err) {
      console.log(err);
      return res.status(500).send([{ msg: "An internal error occurred" }]);
    }
  }),
];

exports.book_review_delete_get = asyncHandler(async (req, res, next) => {
  try {
    if (req.user) {
      console.log("getting form");
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
          title: "Delete Review - Garden of Pages",
          user: req.user,
          bookReview: bookReview,
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
    console.log(err);
    return next(err);
  }
});

exports.book_review_delete_post = asyncHandler(async (req, res, next) => {
  try {
    if (req.user) {
      const bookReview = await BookReview.findById(
        req.body.bookReviewId
      ).exec();

      await BookReview.findOneAndDelete({ book: book }).exec();
      return res.redirect("/book-reviews");
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
