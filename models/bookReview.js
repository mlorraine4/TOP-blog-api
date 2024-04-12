const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BookReviewSchema = new Schema({
  body: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  timestamp: { type: Date, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  tags: [{ type: Schema.Types.ObjectId, ref: "Tags", required: true }],
});

// Export model
module.exports = mongoose.model("BookReview", BookReviewSchema);
