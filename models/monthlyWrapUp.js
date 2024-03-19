const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MonthlyWrapUpSchema = new Schema({
  year: { type: Number, required: true },
  month: { type: String, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  cover_url: { type: String, required: true },
  summary: { type: String },
  timestamp: { type: Date, required: true },
});

// Virtual for genreinstance's URL
MonthlyWrapUpSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/monthly-wrap-up/${this.year}/${this.month}`;
});

// Export model
module.exports = mongoose.model("MonthlyWrapUp", MonthlyWrapUpSchema);
