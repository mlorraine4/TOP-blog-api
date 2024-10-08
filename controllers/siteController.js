const Post = require("../models/post");
const passport = require("passport");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.home_get = asyncHandler(async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("books book")
      .sort({ timestamp: -1 })
      .exec();
    console.log(posts);
    return res.render("index", {
      title: "Garden of Pages",
      user: req.user,
      posts: posts,
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

exports.log_in_GET = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.render("login-form", { title: "Log In - Garden of Pages" });
  } else {
    return res.redirect("/");
  }
});

exports.log_in_POST = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/log-in",
});

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
