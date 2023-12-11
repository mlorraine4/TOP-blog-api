const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  series: { type: String },
  series_number: { type: Number },
  book_cover_url: { type: String, required: true },
  pages: { type: Number, required: true, max: 5000 },
  rating: { type: Number, required: true, max: 5 },
  date_read: [{ type: Date }],
  encodedTitle: { type: String, required: true},
  encodedAuthor: {type: String, required: true}
});

BookSchema.virtual("url").get(function () {
  // const encodedTitle = this.title
  //   .toLowerCase()
  //   .replace(/[^\w\s-]+/g, "")
  //   .replace(/\s+/g, "-");
  // const encodedAuthor = this.author
  //   .toLowerCase()
  //   .replace(/[^\w\s-]+/g, "")
  //   .replace(/\s+/g, "-");
  return `/gardenofpages/book/${this.encodedAuthor}/${this.encodedTitle}`;
});

// Export model
module.exports = mongoose.model("Book", BookSchema);
