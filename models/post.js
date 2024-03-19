const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  post: [{ type: Schema.Types.ObjectId, ref: "Comments" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }],
  category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
});

// Virtual for author's URL
PostSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/${this._id}`;
});

// Export model
module.exports = mongoose.model("Post", PostSchema);
