const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Post = require("./post");

const BookReviewSchema = new Schema({
  review: { type: String, required: true },
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
});

// Export model
Post.discriminator("BookReview", BookReviewSchema);
module.exports = mongoose.model("BookReview");
