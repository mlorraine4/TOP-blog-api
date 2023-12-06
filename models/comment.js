const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  name: { type: String, required: true, maxLength: 15 },
  text: { type: String, required: true, maxLength: 200 },
  timestamp: { type: Date, required: true },
});

// Export model
module.exports = mongoose.model("Comment", CommentSchema);
