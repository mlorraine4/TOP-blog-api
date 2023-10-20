const passport = require("passport");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// GET request for log in form.
exports.log_in_GET = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.render("login-form");
  } else {
    res.redirect("/");
  }
});

// POST request for log in form submission.
exports.log_in_POST = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/gardenofpages/log-in",
});

// GET request for user log out (no POST, log out is handled by express middleware)
exports.log_out_GET = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

exports.sign_up_get = async (req, res, next) => {
  if (!req.user) {
    res.render("signup-form");
  } else {
    res.redirect("/");
  }
};

exports.sign_up_post = async (req, res, next) => {
  try {
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      const user = new User({
        username: req.body.username,
        password: hashedPassword,
        display_name: req.body.display_name,
        is_admin: false,
      });
      const result = await user.save();
      res.redirect("/");
    });
  } catch (err) {
    return next(err);
  }
};

exports.calendar_get = asyncHandler(async (req, res, next) => {
  res.render("upcoming-releases-calendar", { title: "Upcoming Releases" });
});

exports.user_dashboard_get = asyncHandler(async (req, res, next) => {
  // TODO: add if admin to user-dashboard page
  // if (req.user) {
  res.render("user-dashboard", { title: "Dashboard", user: req.user });
  // } else {
  //   res.redirect("/");
  // }
});

exports.user_account_get = asyncHandler(async (req, res, next) => {
  // if (req.user) {
  res.render("account", { title: "Account", user: req.user });
  // } else {
  //   res.redirect("/");
  // }
});

exports.not_found = asyncHandler(async (req, res, next) => {
  res.render("404");
});
