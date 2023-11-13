const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Book = require("../models/book");
const BookReview = require("../models/bookReview");

exports.book_list_get = asyncHandler(async (req, res, next) => {
  try {
    const books = await Book.find().exec();
    res.render("library", { user: req.user, books: books });
  } catch (err) {
    return next(err);
  }
});

exports.book_form_get = asyncHandler(async (req, res, next) => {
  if (req.user) {
    res.render("book-form", { user: req.user, title: "Add Book" });
  } else {
    res.redirect("/gardenofpages/log-in");
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
      const errors = validationResult(req);
      let datesArray = [];

      // if (req.user) {
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
        });

        if (!errors.isEmpty()) {
          res.render("book-form", {
            user: req.user,
            title: "Add Book",
            book: book,
            errors: errors.array(),
          });
        } else {
          const result = await book.save();
          res.redirect(result.url);
        }
      }
      // } else {
      //   const err = new Error("You must be an authorized user.");
      //   err.status = 401;
      //   return next(err);
      // }
    } catch (err) {
      return next(err);
    }
  }),
];

exports.book_detail_get = asyncHandler(async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).exec();

    if (book !== null) {
      res.render("book-detail", { user: req.user, book: book });
      return;
    } else {
      res.redirect("/gardenofpages/404");
    }
  } catch (err) {
    return next(err);
  }
});

exports.book_update_get = asyncHandler(async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).exec();

    if (book !== null) {
      res.render("book-form", {
        user: req.user,
        title: "Edit Book",
        book: book,
      });
      return;
    } else {
      res.redirect("/gardenofpages/404");
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
      const book = Book.findById(req.params.id).exec();

      if (book !== null) {
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
        });

        if (!errors.isEmpty()) {
          res.render("book-form", {
            user: req.user,
            title: "Add Book",
            book: updatedBook,
            errors: errors.array(),
          });
          return;
        } else {
          const result = await Book.findByIdAndUpdate(
            req.params.id,
            updatedBook,
            {}
          );
          res.redirect(result.url);
        }
      } else {
        // No results.
        res.redirect("/gardenofpages/404");
      }
    } catch (err) {
      return next(err);
    }
  }),
];

exports.book_delete_get = asyncHandler(async (req, res, next) => {
  const [book, bookReview] = await Promise.all([
    Book.findById(req.params.id).exec(),
    BookReview.findOne({ book: req.params.id }).exec(),
  ]);

  if (book !== null) {
    res.render("book-delete", {
      user: req.user,
      book: book,
      book_review: bookReview,
    });
    return;
  } else {
    res.redirect("/library");
  }
});

exports.book_delete_post = asyncHandler(async (req, res, next) => {
  const [book, bookReview] = await Promise.all([
    Book.findById(req.params.id).exec(),
    BookReview.findOne({ book: req.params.id }).exec(),
  ]);

  if (bookReview !== null) {
    res.render("book-review-delete", {
      user: req.user,
      book_review: bookReview,
      book: book,
    });
    return;
  } else {
    await Book.findByIdAndRemove(req.body.bookid);
    res.redirect("/library");
  }
});

exports.masterlist_get = asyncHandler(async (req, res, next) => {
  res.render("masterlist", { user: req.user });
});
