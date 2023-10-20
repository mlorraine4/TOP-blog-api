const asyncHandler = require("express-async-handler");
const Tags = require("../models/tags");

exports.tag_list_get = asyncHandler(async (req, res, next) => {
  try {
    const tag = await Tags.findOne({ name: req.params.name });
    const reviews = await BookReview.find({
      tags: tag,
    })
      .populate("book")
      .exec();

    if (tag !== null) {
      res.render("tag-detail", {
        reviews: reviews,
      });
      return;
    } else {
      // No results.
      res.redirect("/gardenofpages/404");
    }
  } catch (err) {
    return next(err);
  }
});