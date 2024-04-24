const passport = require("passport");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// GET request for log in form.
exports.log_in_GET = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.render("login-form", { title: "Log In - Garden of Pages" });
  } else {
    return res.redirect("/");
  }
});

// POST request for log in form submission.
exports.log_in_POST = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/log-in",
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
    return res.render("signup-form", { title: "Sign Up - Garden of Pages" });
  } else {
    return res.redirect("/");
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
      return res.redirect("/");
    });
  } catch (err) {
    return next(err);
  }
};

exports.calendar_get = asyncHandler(async (req, res, next) => {
  return res.render("upcoming-releases-calendar", {
    user: req.user,
    title: "Upcoming Releases - Garden of Pages",
  });
});

exports.user_dashboard_get = asyncHandler(async (req, res, next) => {
  if (req.user) {
    return res.render("user-dashboard", {
      title: "Dashboard - Garden of Pages",
      user: req.user,
    });
  } else {
    return res.redirect("/");
  }
});

exports.user_account_get = asyncHandler(async (req, res, next) => {
  if (req.user) {
    return res.render("account", {
      title: "Account - Garden of Pages",
      user: req.user,
    });
  } else {
    return res.redirect("/");
  }
});
