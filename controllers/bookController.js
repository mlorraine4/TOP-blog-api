const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Book = require("../models/book");
const BookReview = require("../models/bookReview");

exports.book_list_get = asyncHandler(async (req, res, next) => {
  try {
    const books = await Book.find()
      .sort({ author: 1 })
      .collation({ locale: "en", caseLevel: true })
      .exec();
    return res.render("library", { user: req.user, books: books });
  } catch (err) {
    return next(err);
  }
});

exports.book_form_get = asyncHandler(async (req, res, next) => {
  if (req.user) {
    return res.render("book-form", { user: req.user, title: "Add Book" });
  } else {
    // User is not logged in.
    const err = new Error("You must be an authorized user.");
    err.status = 401;
    return next(err);
  }
});

exports.book_form_post = [
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("series").escape(),
  body("pages", "Pages must not be empty.")
    .trim()
    .isLength({ min: 1, max: 5000 })
    .escape(),
  body("book_cover", "Book cover url must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("rating", "Rating must not be empty.")
    .isLength({ min: 1, max: 5 })
    .escape(),
  body("dates_read").escape(),

  asyncHandler(async (req, res, next) => {
    try {
      if (req.user) {
        const errors = validationResult(req);
        let datesArray = [];

        let bookRes = await Book.findOne({
          author: req.body.author,
          title: req.body.title,
        }).exec();

        if (bookRes !== null) {
          // Book already exists.
          const err = new Error("Book has already been added.");
          err.status = 409;
          return next(err);
        } else {
          if (req.body.dates_read.includes(",")) {
            // There are multiple read dates.
            const datesReqArr = req.body.dates_read.split(",");
            for (const date of datesReqArr) {
              datesArray.push(date);
            }
          } else {
            // There is a single date.
            datesArray.push(req.body.dates_read);
          }

          const book = new Book({
            title: req.body.title,
            author: req.body.author,
            series: req.body.series,
            pages: req.body.pages,
            series_number: req.body.series_number,
            book_cover_url: req.body.book_cover,
            rating: req.body.rating,
            date_read: datesArray,
            encodedTitle: req.body.title
              .toLowerCase()
              .replace(/[^\w\s-]+/g, "")
              .replace(/\s+/g, "-"),
            encodedAuthor: req.body.author
              .toLowerCase()
              .replace(/[^\w\s-]+/g, "")
              .replace(/\s+/g, "-"),
          });

          if (!errors.isEmpty()) {
            // Form data is not valid. Re-render with errors.
            return res.render("book-form", {
              user: req.user,
              title: "Add Book",
              book: book,
              errors: errors.array(),
            });
          } else {
            // Data is valid. Save book.
            const result = await book.save();
            return res.redirect(result.url);
          }
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

exports.book_detail_get = asyncHandler(async (req, res, next) => {
  try {
    // const book = await Book.findById(req.params.id).exec();

    const book = await Book.findOne({
      encodedTitle: req.params.title,
      encodedAuthor: req.params.author,
    }).exec();

    if (book !== null) {
      // Book exists.
      return res.render("book-detail", { user: req.user, book: book });
    } else {
      // No results.
      const err = new Error("Book does not exist.");
      err.status = 404;
      return next(err);
    }
  } catch (err) {
    return next(err);
  }
});

exports.book_update_get = asyncHandler(async (req, res, next) => {
  try {
    // const book = await Book.findById(req.params.id).exec();

    const book = await Book.findOne({
      encodedTitle: req.params.title,
      encodedAuthor: req.params.author,
    }).exec();

    if (book !== null) {
      // Book exists.
      return res.render("book-form", {
        user: req.user,
        title: "Edit Book",
        book: book,
      });
    } else {
      // No results.
      const err = new Error("Book does not exist.");
      err.status = 404;
      return next(err);
    }
  } catch (err) {
    return next(err);
  }
});

exports.book_update_post = [
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("series").escape(),
  body("pages", "Pages must not be empty.")
    .trim()
    .isLength({ min: 1, max: 5000 })
    .escape(),
  body("book_cover", "Book cover url must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("rating", "Rating must not be empty.")
    .isLength({ min: 1, max: 5 })
    .escape(),
  body("dates_read").escape(),

  asyncHandler(async (req, res, next) => {
    try {
      if (req.user) {
        // const book = Book.findById(req.params.id).exec();
        const book = await Book.findOne({
          encodedTitle: req.params.title,
          encodedAuthor: req.params.author,
        }).exec();

        if (book !== null) {
          // Book exists.
          let datesArray = [];
          const errors = validationResult(req);

          if (req.body.dates_read.includes(",")) {
            // There are multiple read dates.
            const datesReqArr = req.body.dates_read.split(",");
            for (const date of datesReqArr) {
              datesArray.push(date);
            }
          } else {
            // There is a single date.
            datesArray.push(req.body.dates_read);
          }

          const updatedBook = new Book({
            title: req.body.title,
            author: req.body.author,
            series: req.body.series,
            pages: req.body.pages,
            series_number: req.body.series_number,
            book_cover_url: req.body.book_cover,
            rating: req.body.rating,
            date_read: datesArray,
            _id: req.params.id,
            encodedTitle: req.body.title
              .toLowerCase()
              .replace(/[^\w\s-]+/g, "")
              .replace(/\s+/g, "-"),
            encodedAuthor: req.body.author
              .toLowerCase()
              .replace(/[^\w\s-]+/g, "")
              .replace(/\s+/g, "-"),
          });

          if (!errors.isEmpty()) {
            // Form data is not valid. Re-render with errors.
            return res.render("book-form", {
              user: req.user,
              title: "Add Book",
              book: updatedBook,
              errors: errors.array(),
            });
          } else {
            // Data is valid. Update book.
            const result = await Book.findByIdAndUpdate(
              req.params.id,
              updatedBook,
              {}
            );
            return res.redirect(result.url);
          }
        } else {
          // No results.
          const err = new Error("Book does not exist.");
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

exports.book_delete_get = asyncHandler(async (req, res, next) => {
  try {
    if (req.user) {
      const book = await Book.findOne({
        encodedTitle: req.params.title,
        encodedAuthor: req.params.author,
      }).exec();

      if (book !== null) {
        // Book exists.
        const bookReview = await BookReview.findOne({
          book: book,
        }).exec();

        return res.render("book-delete", {
          user: req.user,
          book: book,
          book_review: bookReview,
        });
      } else {
        // No results.
        const err = new Error("Book does not exist.");
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

exports.book_delete_post = asyncHandler(async (req, res, next) => {
  try {
    if (req.user) {
      const book = await Book.findOne({
        encodedTitle: req.params.title,
        encodedAuthor: req.params.author,
      }).exec();

      if (book !== null) {
        // Book exists.
        const bookReview = await BookReview.findOne({
          book: book,
        }).exec();

        if (bookReview !== null) {
          // Book review exists. Send error.
          const err = new Error(
            "You must delete the associated review before deleting this book."
          );
          err.status = 409;
          return next(err);
        } else {
          // An associated book review does not exist, OK to delete book.
          await Book.findByIdAndRemove(req.body.bookid);
          return res.redirect("/library");
        }
      } else {
        // No results.
        const err = new Error("Book does not exist.");
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

exports.tbr_list_get = asyncHandler(async (req, res, next) => {
  res.render("masterlist", { user: req.user });
});
