const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const MonthlyWrapUp = require("../models/monthlyWrapUp");
const Book = require("../models/book");
const moment = require("moment");

exports.wrapUp_list_get = asyncHandler(async (req, res, next) => {
  try {
    const wrapUps = await MonthlyWrapUp.find().sort({ timestamp: -1 }).exec();

    return res.render("wrap-up-list", {
      user: req.user,
      wrapUps: wrapUps,
      title: "Monthly Wrap Ups",
    });
  } catch (err) {
    return next(err);
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
      title: req.params.year,
    });
  } catch (err) {
    return next(err);
  }
});

exports.wrapUp_detail_get = asyncHandler(async (req, res, next) => {
  try {
    const month_format =
      req.params.month.substring(0, 1).toUpperCase() +
      req.params.month.substring(1);

    const wrapUp = await MonthlyWrapUp.findOne({
      month: month_format,
      year: req.params.year,
    })
      .populate({ path: "comments", options: { sort: { timestamp: -1 } } })
      .exec();

    if (wrapUp !== null) {
      // Wrap Up exists. Query for books read during the month.
      const dateString = req.params.month + " 1, " + req.params.year;
      const date = new Date(dateString);
      const month = date.getMonth();
      const year = date.getFullYear();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const books = await Book.find({
        date_read: {
          $gte: startDate,
          $lt: endDate,
        },
      });

      // let totalPages = 0;
      // let ratings = 0;
      // wrapUp.books.forEach((book) => {
      //   totalPages += book.pages;
      //   ratings += book.rating;
      // });

      // const avgRating = ratings / wrapUp.books.length;
      // const formattedPages = totalPages.toLocaleString("en-US");

      return res.render("wrap-up-detail", {
        user: req.user,
        wrapUp: wrapUp,
        books: books,
        month: month_format,
        year: req.params.year,
        // totalPages: formattedPages,
        // avgRating: avgRating,
      });
    } else {
      const err = new Error("Wrap up does not exist.");
      err.status = 404;
      return next(err);
    }
  } catch (err) {
    return next(err);
  }
});

exports.wrapUp_form_get = asyncHandler(async (req, res, next) => {
  if (req.user) {
    return res.render("wrap-up-form", {
      user: req.user,
      title: "Add Monthly Wrap Up",
    });
  } else {
    const err = new Error("You must be an authorized user.");
    err.status = 401;
    return next(err);
  }
});

exports.wrapUp_form_post = [
  body("cover_url", "Photo url is required.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary").trim().escape(),
  body("year", "Year is required.").trim().notEmpty().isNumeric(),
  body("month", "Month is required.").trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    try {
      if (req.user) {
        const errors = validationResult(req);
        const dateString = req.body.month + "1, " + req.body.year;
        const date = new Date(dateString);
        const month = date.getMonth();
        const year = date.getFullYear();
        const myDate = new Date(year, month + 1, 1);

        const wrapUp = new MonthlyWrapUp({
          year: req.body.year,
          month: req.body.month,
          summary: req.body.summary,
          cover_url: req.body.cover_url,
          timestamp: myDate,
        });

        if (!errors.isEmpty()) {
          // Form data is not valid. Re-render form with data and errors.
          return res.render("wrap-up-form", {
            user: req.user,
            title: "Edit Wrap Up",
            wrapUp: wrapUp,
            errors: errors.array(),
          });
        } else {
          // Form data is valid. Check if month is valid.
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

          if (!monthArr.includes(req.body.month)) {
            // Month provided is not a valid month.
            return res.render("wrap-up-form", {
              user: req.user,
              title: "Edit Wrap Up",
              wrapUp: wrapUp,
              errors: [
                ...errors.array(),
                { msg: `${req.body.month} is not a correct month format.` },
              ],
            });
          } else {
            // All form data is valid.
            const wrapUpDB = await MonthlyWrapUp.findOne({
              month: req.body.month,
              year: req.body.year,
            }).exec();

            if (wrapUpDB === null) {
              // Wrap up does not already exist. Save new wrap up.
              const result = await wrapUp.save();
              return res.redirect(result.url);
            } else {
              // Wrap up already exists. Return error.
              return res.render("wrap-up-form", {
                user: req.user,
                title: "Edit Wrap Up",
                wrapUp: wrapUp,
                errors: [
                  {
                    msg: `${req.body.month} ${req.body.year} wrap up already exists.`,
                  },
                ],
              });
            }
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

exports.wrapUp_update_get = asyncHandler(async (req, res, next) => {
  try {
    if (req.user) {
      const wrapUp = await MonthlyWrapUp.findOne({
        month: req.params.month,
        year: req.params.year,
      }).exec();

      if (wrapUp !== null) {
        return res.render("wrap-up-form", {
          user: req.user,
          wrapUp: wrapUp,
          title: "Edit Monthly Wrap Up",
        });
      } else {
        // No results.
        const err = new Error("Wrap Up does not exist.");
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

// TODO: write custom sanitizer for month instead of checking array separately
exports.wrapUp_update_post = [
  body("cover_url", "Photo url is required.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary").trim().escape(),
  body("year", "Year is required.").trim().notEmpty().isNumeric(),
  body("month", "Month is required.").trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    try {
      if (req.user) {
        const errors = validationResult(req);

        const existingWrapUp = await MonthlyWrapUp.findOne({
          month: req.params.month,
          year: req.params.year,
        }).exec();

        if (existingWrapUp !== null) {
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
          const myDate = new Date(year, month + 1, 0);

          const updatedWrapUp = new MonthlyWrapUp({
            year: req.body.year,
            month: req.body.month,
            summary: req.body.summary,
            cover_url: req.body.cover_url,
            timestamp: myDate,
          });

          if (!monthArr.includes(req.body.month)) {
            return res.render("wrap-up-form", {
              user: req.user,
              title: "Edit Wrap Up",
              wrapUp: updatedWrapUp,
              errors: [
                ...errors.array(),
                { msg: `${req.body.month} is not a correct month format.` },
              ],
            });
          } else if (!errors.isEmpty()) {
            return res.render("wrap-up-form", {
              user: req.user,
              title: "Edit Wrap Up",
              wrapUp: updatedWrapUp,
              errors: errors.array(),
            });
          } else {
            // Data is valid. Update monthly wrap up.
            const result = await MonthlyWrapUp.findByIdAndUpdate(
              existingWrapUp.id,
              updatedWrapUp,
              {}
            );
            return res.redirect(result.url);
          }
        } else {
          // No results.
          const err = new Error("Wrap up does not exist.");
          err.status = 404;
          return next(err);
        }
      } else {
        const err = new Error("You must be an authorized user.");
        err.status = 401;
        return next(err);
      }
    } catch (err) {
      return next(err);
    }
  }),
];
