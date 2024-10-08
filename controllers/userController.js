const passport = require("passport");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

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
