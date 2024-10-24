const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };

// TODO: change to camel case
const BookSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    series: { type: String },
    series_number: { type: Number },
    book_cover_url: { type: String, required: true },
    pages: { type: Number, required: true, max: 5000 },
    rating: { type: Number, required: true, max: 5 },
    date_read: [{ type: Date }],
    encodedTitle: { type: String, required: true },
    encodedAuthor: { type: String, required: true },
    goodreads_url: { type: String },
    synopsis: { type: String },
    is_favorite: { type: Boolean },
  },
  opts
);

BookSchema.index({ title: "text", author: "text", series: "text" });

BookSchema.virtual("url").get(function () {
  return `/books/${this.encodedAuthor}/${this.encodedTitle}`;
});

BookSchema.virtual("reviewUrl").get(function () {
  return `/book-reviews/${this.encodedAuthor}/${this.encodedTitle}`;
});

BookSchema.virtual("reviewFormUrl").get(function () {
  return `/book-reviews/${this.encodedAuthor}/${this.encodedTitle}/add`;
});

// Export model
module.exports = mongoose.model("Book", BookSchema);
