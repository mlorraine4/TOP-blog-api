const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const MonthlyWrapUp = require("../models/monthlyWrapUp");
const Book = require("../models/book");

exports.wrapUp_list_get = asyncHandler(async (req, res, next) => {
  try {
    const wrapUps = await MonthlyWrapUp.find().sort({ timestamp: -1 }).exec();

    res.render("wrap-up-list", { wrapUps: wrapUps, title: "Monthly Wrap Ups" });
  } catch (err) {
    return next(err);
  }
});

exports.wrapUp_yearly_list_get = asyncHandler(async (req, res, next) => {
  try {
    const wrapUps = await MonthlyWrapUp.find({ year: req.params.year })
      .sort({ timestamp: -1 })
      .exec();

    res.render("wrap-up-list", {
      wrapUps: wrapUps,
      title: req.params.year,
    });
  } catch (err) {
    return next(err);
  }
});

exports.wrapUp_detail_get = asyncHandler(async (req, res, next) => {
  try {
    const wrapUp = await MonthlyWrapUp.findOne({
      month: req.params.month,
      year: req.params.year,
    }).exec();

    if (wrapUp !== null) {
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

      res.render("wrap-up-detail", {
        wrapUp: wrapUp,
        books: books,
        month: req.params.month,
        year: req.params.year,
        // totalPages: formattedPages,
        // avgRating: avgRating,
      });
      return;
    } else {
      res.redirect("/gardenofpages/404");
    }
  } catch (err) {
    return next(err);
  }
});

exports.wrapUp_form_get = asyncHandler(async (req, res, next) => {
  // if (req.user) {
  res.render("wrap-up-form", {
    user: req.user,
    title: "Add Monthly Wrap Up",
  });
  // } else {
  //   res.redirect("/");
  // }
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
      // if (req.user) {
      const errors = validationResult(req);

      const month = [
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

      const date = req.body.month + "1, " + req.body.year;

      const wrapUpDB = await MonthlyWrapUp.findOne({
        month: req.body.month,
        year: req.body.year,
      }).exec();

      const wrapUp = new MonthlyWrapUp({
        year: req.body.year,
        month: req.body.month,
        summary: req.body.summary,
        cover_url: req.body.cover_url,
        timestamp: new Date(date),
      });

      if (wrapUpDB === null) {
        if (!month.includes(req.params.month)) {
          res.render("wrap-up-form", {
            title: "Edit Wrap Up",
            wrapUp: wrapUp,
            errors: [
              ...errors.array(),
              { msg: `${req.body.month} is not a correct month format.` },
            ],
          });
          return;
        }

        if (!errors.isEmpty()) {
          // Form data is not valid. Re-render form with data and errors.
          res.render("wrap-up-form", {
            title: "Edit Wrap Up",
            wrapUp: wrapUp,
            errors: errors.array(),
          });
          return;
        } else {
          // Data is valid. Save monthly wrap up.
          const result = await wrapUp.save();
          res.redirect(result.url);
        }
      } else {
        // Monthly wrap up already exists.
        res.render("wrap-up-form", {
          title: "Edit Wrap Up",
          wrapUp: wrapUp,
          errors: [
            ...errors.array(),
            {
              msg: `${req.body.month} ${req.body.year} wrap up already exists.`,
            },
          ],
        });
        return;
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

exports.wrapUp_update_get = asyncHandler(async (req, res, next) => {
  // if (req.user) {
  try {
    const wrapUp = await MonthlyWrapUp.findOne({
      month: req.params.month,
      year: req.params.year,
    }).exec();

    if (wrapUp !== null) {
      res.render("wrap-up-form", {
        user: req.user,
        wrapUp: wrapUp,
        title: "Edit Monthly Wrap Up",
      });
      return;
    } else {
      res.redirect("/gardenofpages/404");
    }
  } catch (err) {
    return next(err);
  }

  // } else {
  //   res.redirect("/");
  // }
});

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
      // if (req.user) {
      const errors = validationResult(req);

      const wrapUpDB = await MonthlyWrapUp.findOne({
        month: req.params.month,
        year: req.params.year,
      }).exec();

      if (wrapUpDB !== null) {
        const month = [
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

        const date = req.body.month + "1, " + req.body.year;

        const updatedWrapUp = new MonthlyWrapUp({
          year: req.body.year,
          month: req.body.month,
          summary: req.body.summary,
          cover_url: req.body.cover_url,
          timestamp: new Date(date),
        });

        if (!month.includes(req.body.month)) {
          res.render("wrap-up-form", {
            title: "Edit Wrap Up",
            wrapUp: updatedWrapUp,
            errors: [
              ...errors.array(),
              { msg: `${req.body.month} is not a correct month format.` },
            ],
          });
          return;
        } else if (!errors.isEmpty()) {
          res.render("wrap-up-form", {
            title: "Edit Wrap Up",
            wrapUp: updatedWrapUp,
            errors: errors.array(),
          });
          return;
        } else {
          // Data is valid. Update monthly wrap up.
          const result = await MonthlyWrapUp.findByIdAndUpdate(
            wrapUpDB.id,
            updatedWrapUp,
            {}
          );
          res.redirect(result.url);
        }
      } else {
        // No results.
        res.redirect("/gardenofpages/404");
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
