const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TagsSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxLength: 40,
    minLength: 1,
    text: true,
  },
});

// Virtual for genreinstance's URL
TagsSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/tags/${this.name}`;
});

// Export model
module.exports = mongoose.model("Tags", TagsSchema);
