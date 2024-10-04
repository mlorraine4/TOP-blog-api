const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  formattedTitle: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  tags: [{ type: Schema.Types.ObjectId, ref: "Tags", required: true }],
});

// day returns next day?
PostSchema.virtual("url").get(function () {
  const year = this.timestamp.getFullYear();
  const month = this.timestamp.getMonth() + 1;
  const day = this.timestamp.getDay();
  return `${year}/${month}/${day}/${this.formattedTitle}`;
});

// Export model
module.exports = mongoose.model("Post", PostSchema);
