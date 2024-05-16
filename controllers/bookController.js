const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Book = require("../models/book");
const BookReview = require("../models/bookReview");
const firebaseStorage = require("firebase/storage");
const firebaseApp = require("../firebase");

exports.book_list_get = asyncHandler(async (req, res, next) => {
  try {
    const books = await Book.find()
      .sort({ title: 1 })
      .collation({ locale: "en", caseLevel: true })
      .exec();
    console.log(books[1]);
    return res.render("library", {
      title: "Garden of Pages",
      user: req.user,
      books: books,
    });
  } catch (err) {
    return next(err);
  }
});

exports.book_form_get = asyncHandler(async (req, res, next) => {
  if (req.user) {
    return res.render("book-form", {
      title: "Add Book - Garden of Pages",
      user: req.user,
      header: "Add Book",
    });
  } else {
    // User is not logged in.
    const err = new Error("You must be an authorized user.");
    err.status = 401;
    return next(err);
  }
});

// TODO: custom sanitizor for image data (data url)
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
  body("rating", "Rating must not be empty.")
    .isLength({ min: 1, max: 5 })
    .escape(),
  body("date_read").escape(),

  asyncHandler(async (req, res, next) => {
    try {
      if (req.user) {
        const errors = validationResult(req);
        // let datesArray = [];

        let bookRes = await Book.findOne({
          author: req.body.author,
          title: req.body.title,
        }).exec();

        if (bookRes !== null) {
          // Book already exists.
          return res.status(409).send([
            {
              msg: `${req.body.title} by ${req.body.author} already exists`,
            },
          ]);
        } else {
          // // Save dates read as array.
          // if (req.body.dates_read.includes(",")) {
          //   // There are multiple read dates.
          //   const datesReqArr = req.body.dates_read.split(",");
          //   for (const date of datesReqArr) {
          //     datesArray.push(date);
          //   }
          // } else {
          //   // There is a single date.
          //   datesArray.push(req.body.dates_read);
          // }

          if (!errors.isEmpty()) {
            // Form data is not valid. Send errors.
            return res.status(500).send(errors.array());
          } else {
            // Data is valid. Save image to storage and add book to database.

            // Create storage reference
            const storage = firebaseStorage.getStorage();
            const storageRef = firebaseStorage.ref(
              storage,
              `book-covers/${req.body.encoded_author}/${req.body.encoded_title}`
            );

            // Save image
            const upload = await firebaseStorage.uploadString(
              storageRef,
              req.body.image,
              "data_url"
            );

            // Get image url
            const url = await firebaseStorage.getDownloadURL(storageRef);

            const book = new Book({
              title: req.body.title,
              author: req.body.author,
              series: req.body.series,
              pages: req.body.pages,
              series_number: req.body.series_number,
              rating: req.body.rating,
              book_cover_url: url,
              date_read: [req.body.date_read],
              encodedTitle: req.body.encoded_title,
              encodedAuthor: req.body.encoded_author,
            });

            const result = await book.save();
            // console.log(result);
            return res.status(200).send({ url: result.url });
          }
        }
      } else {
        // User is not logged in.
        return res
          .status(401)
          .send([{ msg: "You must be an authorized user" }]);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send([{ msg: "An internal error occurred" }]);
    }
  }),
];

exports.book_detail_get = asyncHandler(async (req, res, next) => {
  try {
    const book = await Book.findOne({
      encodedTitle: req.params.title,
      encodedAuthor: req.params.author,
    }).exec();

    const review = await BookReview.findOne({ book: book }).exec();

    console.log(review);

    if (book !== null) {
      // Book exists.
      return res.render("book-detail", {
        title: `${book.title} - Garden of Pages`,
        user: req.user,
        book: book,
        review: review,
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

exports.book_update_get = asyncHandler(async (req, res, next) => {
  try {
    const book = await Book.findOne({
      encodedTitle: req.params.title,
      encodedAuthor: req.params.author,
    }).exec();

    if (book !== null) {
      // Book exists.
      return res.render("book-form", {
        title: "Update Book - Garden of Pages",
        user: req.user,
        header: "Update Book",
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
  body("encoded_title", "An error occurred.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("encoded_author", "An error occurred.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("series").escape(),
  body("pages", "Pages must not be empty.")
    .trim()
    .isLength({ min: 1, max: 5000 })
    .escape(),
  body("rating", "Rating must not be empty.")
    .isLength({ min: 1, max: 5 })
    .escape(),
  body("date_read").escape(),

  asyncHandler(async (req, res, next) => {
    try {
      if (req.user) {
        const errors = validationResult(req);

        // const book = Book.findById(req.params.id).exec();
        const book = await Book.findOne({
          encodedTitle: req.params.title,
          encodedAuthor: req.params.author,
        }).exec();

        if (book !== null) {
          // Book exists.
          // let datesArray = [];

          // if (req.body.dates_read.includes(",")) {
          //   // There are multiple read dates.
          //   const datesReqArr = req.body.dates_read.split(",");
          //   for (const date of datesReqArr) {
          //     datesArray.push(date);
          //   }
          // } else {
          //   // There is a single date.
          //   datesArray.push(req.body.dates_read);
          // }

          if (!errors.isEmpty()) {
            // Form data is not valid. Re-render with errors.
            return res.status(500).send(errors.array());
          } else {
            // Data is valid. Update book.

            // Create storage reference
            const storage = firebaseStorage.getStorage();
            const storageRef = firebaseStorage.ref(
              storage,
              `book-covers/${req.body.encoded_author}/${req.body.encoded_title}`
            );

            // Save image
            const upload = await firebaseStorage.uploadString(
              storageRef,
              req.body.image,
              "data_url"
            );

            // Get image url
            const url = await firebaseStorage.getDownloadURL(storageRef);

            const updatedBook = new Book({
              _id: book._id,
              title: req.body.title,
              author: req.body.author,
              series: req.body.series,
              pages: req.body.pages,
              series_number: req.body.series_number,
              rating: req.body.rating,
              book_cover_url: url,
              date_read: [req.body.date_read],
              encodedTitle: req.body.encoded_title,
              encodedAuthor: req.body.encoded_author,
            });

            const result = await Book.findByIdAndUpdate(
              book._id,
              updatedBook,
              {}
            );

            return res.status(200).send({ url: result.url });
          }
        } else {
          // No results.
          return res.status(404).send([
            {
              msg: `${req.body.title} by ${req.body.author} does not exist`,
            },
          ]);
        }
      } else {
        // User is not logged in.
        return res
          .status(401)
          .send([{ msg: "You must be an authorized user" }]);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send([{ msg: "An internal error occurred" }]);
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
          title: "Delete Book - Garden of Pages",
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
          await Book.findByIdAndRemove(book._id);
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
