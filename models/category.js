const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { type: String, required: true, maxLength: 40, minLength: 3 },
  url_name: {type: String, required: true}
});

// Virtual for genreinstance's URL
CategorySchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/gardenofpages/${this.url_name}`;
});

// Export model
module.exports = mongoose.model("Category", CategorySchema);
