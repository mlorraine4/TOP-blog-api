const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BookReviewSchema = new Schema({
  body: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  book: { type: Schema.Types.ObjectId, ref: "Book" },
  timestamp: { type: Date, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  tags: [{ type: Schema.Types.ObjectId, ref: "Tags", required: true }],
});

// Virtual for author's URL
BookReviewSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/gardenofpages/book-review/${this._id}`;
});

// Export model
module.exports = mongoose.model("BookReview", BookReviewSchema);
