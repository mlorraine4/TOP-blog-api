const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const MonthlyWrapUp = require("../models/monthlyWrapUp");
const Tag = require("../models/tag");
const Book = require("../models/book");
const moment = require("moment");
const httpStatusCodes = require("http-status-codes");

exports.wrapUp_list_get = asyncHandler(async (req, res, next) => {
  try {
    const wrapUps = await MonthlyWrapUp.find()
      .populate("books")
      .sort({ timestamp: -1 })
      .limit(6)
      .exec();

    return res.render("wrap-up-list", {
      user: req.user,
      wrapUps: wrapUps,
      title: "Monthly Wrap Ups - Garden of Pages",
    });
  } catch (err) {
    console.log(err);
    const publicErr = new Error(
      httpStatusCodes.ReasonPhrases.INTERNAL_SERVER_ERROR
    );
    publicErr.status = httpStatusCodes.StatusCodes.INTERNAL_SERVER_ERROR;
    return next(publicErr);
  }
});

exports.wrapUp_yearly_list_get = asyncHandler(async (req, res, next) => {
  try {
    const wrapUps = await MonthlyWrapUp.find({ year: req.params.year })
      .sort({ timestamp: -1 })
      .exec();

    return res.render("wrap-up-list", {
      user: req.user,
      wrapUps: wrapUps,
      year: req.params.year,
      title: `${req.params.year} Wrap Ups - Garden of Pages`,
    });
  } catch (err) {
    console.log(err);
    const publicErr = new Error(
      httpStatusCodes.ReasonPhrases.INTERNAL_SERVER_ERROR
    );
    publicErr.status = httpStatusCodes.StatusCodes.INTERNAL_SERVER_ERROR;
    return next(publicErr);
  }
});

exports.wrapUp_detail_get = asyncHandler(async (req, res, next) => {
  try {
    const month_format =
      req.params.month.substring(0, 1).toUpperCase() +
      req.params.month.substring(1);

    const wrapUp = await MonthlyWrapUp.findOne({
      year: req.params.year,
      month: month_format,
    })
      .populate("books")
      .populate({ path: "comments", options: { sort: { timestamp: -1 } } })
      .exec();

    if (wrapUp === null) {
      // No results
      const err = new Error(httpStatusCodes.ReasonPhrases.NOT_FOUND);
      err.status = httpStatusCodes.StatusCodes.NOT_FOUND;
      return next(err);
    }

    let totalPages = 0;
    let ratings = 0;
    wrapUp.books.forEach((book) => {
      totalPages += book.pages;
      ratings += book.rating;
    });

    // TODO: round up or down
    // const avgRating = ratings / books.length;
    const formattedPages = totalPages.toLocaleString("en-US");

    return res.render("wrap-ups-" + req.params.year + "/" + req.params.month, {
      title: `${wrapUp.month} ${wrapUp.year} - Garden of Pages`,
      user: req.user,
      wrapUp: wrapUp,
      books: wrapUp.books,
      month: wrapUp.month,
      year: req.params.year,
      totalPages: formattedPages,
      // avgRating: avgRating,
    });
  } catch (err) {
    console.log(err);
    const publicErr = new Error(
      httpStatusCodes.ReasonPhrases.INTERNAL_SERVER_ERROR
    );
    publicErr.status = httpStatusCodes.StatusCodes.INTERNAL_SERVER_ERROR;
    return next(publicErr);
  }
});

exports.wrapUp_form_get = asyncHandler(async (req, res, next) => {
  if (req.user) {
    if (req.params.month && req.params.year) {
      const monthFormat =
        req.params.month.substring(0, 1).toUpperCase() +
        req.params.month.substring(1);

      const wrapUp = await MonthlyWrapUp.findOne({
        month: monthFormat,
        year: req.params.year,
      }).exec();

      return res.render("wrap-up-form", {
        user: req.user,
        wrapUp: wrapUp,
        title: "Add Monthly Wrap Up - Garden of Pages",
      });
    }

    return res.render("wrap-up-form", {
      user: req.user,
      title: "Add Monthly Wrap Up - Garden of Pages",
    });
  } else {
    const err = new Error("You must be an authorized user.");
    err.status = 401;
    return next(err);
  }
});

exports.wrapUp_form_post = [
  body("year", "Year is required.").trim().notEmpty().isNumeric(),
  body("month", "Month is required.").trim().notEmpty().escape(),
  body("summary").trim().escape(),
  asyncHandler(async (req, res, next) => {
    try {
      console.log(req.body);
      if (!req.user) {
        // User is not logged in.
        return res.status(httpStatusCodes.StatusCodes.UNAUTHORIZED).send({
          errors: [{ msg: httpStatusCodes.ReasonPhrases.UNAUTHORIZED }],
        });
      }

      // Check if wrap up exists.
      const wrapUpDB = await MonthlyWrapUp.findOne({
        month: req.body.month,
        year: req.body.year,
      }).exec();

      if (wrapUpDB !== null) {
        // Wrap up already exists. Return error.
        return res.status(httpStatusCodes.StatusCodes.CONFLICT).send({
          errors: [
            {
              msg: `${req.body.month} ${req.body.year} wrap up already exists.`,
            },
          ],
        });
      }

      // Check if month is valid.
      const monthArr = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const dateString = req.body.month + "1, " + req.body.year;
      const date = new Date(dateString);
      const month = date.getMonth();
      const year = date.getFullYear();
      const timestamp = new Date(year, month + 1, 1);
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const tag = await Tag.findOne({ name: "monthlywrapup" });

      // Find books read during the month and year
      const books = await Book.find({
        date_read: {
          $gte: startDate,
          $lt: endDate,
        },
      });

      const wrapUp = new MonthlyWrapUp({
        author: req.user,
        year: req.body.year,
        month: req.body.month,
        title: req.body.month + " Monthly Wrap Up",
        summary: req.body.summary,
        comments: [],
        tags: [tag],
        books: books,
        timestamp: timestamp,
      });

      const errors = validationResult(req);

      if (!monthArr.includes(req.body.month)) {
        // Month provided is not a valid month.
        return res.status(httpStatusCodes.StatusCodes.BAD_REQUEST).send({
          errors: [
            ...errors.array(),
            { msg: `${req.body.month} is not a correct month format.` },
          ],
        });
      }

      if (!errors.isEmpty()) {
        // Form data is not valid. Re-render form with data and errors.
        return res.status(httpStatusCodes.StatusCodes.BAD_REQUEST).send({
          errors: [...errors.array()],
        });
      }

      // Save wrap up.
      const result = await wrapUp.save();
      return res.status(200).send({ url: result.url });
    } catch (err) {
      console.log(err);
      return res
        .status(httpStatusCodes.StatusCodes.INTERNAL_SERVER_ERROR)
        .send({
          errors: [httpStatusCodes.ReasonPhrases.INTERNAL_SERVER_ERROR],
        });
    }
  }),
];

exports.wrapUp_update_post = [
  body("summary").trim().escape(),
  body("year", "Year is required.").trim().notEmpty().isNumeric(),
  body("month", "Month is required.").trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    try {
      if (!req.user) {
        // User is not logged in.
        return res.status(httpStatusCodes.StatusCodes.UNAUTHORIZED).send({
          errors: [{ msg: httpStatusCodes.ReasonPhrases.UNAUTHORIZED }],
        });
      }

      const errors = validationResult(req);

      const wrapUp = await MonthlyWrapUp.findOne({
        month:
          req.params.month.substring(0, 1).toUpperCase() +
          req.params.month.substring(1),
        year: req.params.year,
      }).exec();

      if (wrapUp === null) {
        // No results.
        return res
          .status(httpStatusCodes.StatusCodes.NOT_FOUND)
          .send({ errors: [{ msg: httpStatusCodes.ReasonPhrases.NOT_FOUND }] });
      }

      const monthArr = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const dateString = req.body.month + "1, " + req.body.year;
      const date = new Date(dateString);
      const month = date.getMonth();
      const year = date.getFullYear();
      const timestamp = new Date(year, month + 1, 1);
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const tag = await Tag.findOne({ name: "monthlywrapup" });

      // Find books read during the month and year
      const books = await Book.find({
        date_read: {
          $gte: startDate,
          $lt: endDate,
        },
      });

      const updatedWrapUp = new MonthlyWrapUp({
        _id: wrapUp._id,
        author: req.user,
        year: req.body.year,
        month: req.body.month,
        title: req.body.month + " Monthly Wrap Up",
        formattedTitle: "monthly-wrap-ups",
        summary: req.body.summary,
        comments: [],
        tags: [tag],
        books: books,
        timestamp: timestamp,
      });

      if (!monthArr.includes(req.body.month)) {
        // Month provided is not a valid month.
        return res.status(httpStatusCodes.StatusCodes.BAD_REQUEST).send({
          errors: [
            ...errors.array(),
            { msg: `${req.body.month} is not a correct month format.` },
          ],
        });
      }

      if (!errors.isEmpty()) {
        // Form data is not valid. Re-render form with data and errors.
        return res.status(httpStatusCodes.StatusCodes.BAD_REQUEST).send({
          errors: [...errors.array()],
        });
      }

      // Data is valid. Update monthly wrap up.
      const result = await MonthlyWrapUp.findByIdAndUpdate(
        wrapUp.id,
        updatedWrapUp,
        {}
      );
      return res.status(200).send({ url: result.url });
    } catch (err) {
      console.log(err);
      return res
        .status(httpStatusCodes.StatusCodes.INTERNAL_SERVER_ERROR)
        .send({
          errors: [httpStatusCodes.ReasonPhrases.INTERNAL_SERVER_ERROR],
        });
    }
  }),
];
