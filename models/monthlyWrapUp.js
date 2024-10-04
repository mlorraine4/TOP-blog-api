const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };
const Post = require("./post");

const MonthlyWrapUpSchema = new Schema(
  {
    year: { type: Number, required: true },
    month: { type: String, required: true },
    books: [{ type: Schema.Types.ObjectId, ref: "Book", required: true }],
    summary: { type: String },
  },
  opts
);

MonthlyWrapUpSchema.virtual("url").get(function () {
  const month = this.month.toLowerCase();
  // We don't use an arrow function as we'll need the this object
  return `/${this.year}/${month}/monthly-wrap-ups`;
});

// Export model
Post.discriminator("MonthlyWrapUp", MonthlyWrapUpSchema);
module.exports = mongoose.model("MonthlyWrapUp");
