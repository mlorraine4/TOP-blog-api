const Post = require("../models/post");
const passport = require("passport");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.home_get = asyncHandler(async (req, res, next) => {
  try {
    const count = await Post.countDocuments();
    let totalPages = Math.ceil(count / 5);

    if (req.params.pageNumber) {
      if (req.params.pageNumber > 0 && req.params.pageNumber <= totalPages) {
        let skip = (Number(req.params.pageNumber) - 1) * 5;
        const posts = await Post.find()
          .populate("books book")
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(5)
          .exec();

        return res.render("index", {
          title: "Garden of Pages",
          user: req.user,
          posts: posts,
          currentPage: req.params.pageNumber,
          totalPages: totalPages,
        });
      }
      // Not a valid page number
      const err = new Error("Not Found");
      err.status = 404;
      return next(err);
    }

    const posts = await Post.find()
      .populate("books book")
      .sort({ timestamp: -1 })
      .limit(5)
      .exec();

    return res.render("index", {
      title: "Garden of Pages",
      user: req.user,
      posts: posts,
      currentPage: 1,
      totalPages: totalPages,
    });
  } catch (err) {
    console.log(err);
    return next(err);
  }
});

exports.profile_get = asyncHandler(async (req, res) => {
  return res.render("about-me", {
    title: "About Me",
    user: req.user,
  });
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
