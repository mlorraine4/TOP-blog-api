const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, maxLength: 15 },
  password: { type: String, required: true },
  display_name: {type: String, required: true, maxLength: 20},
  is_admin: { type: Boolean, required: true},
  photo_url: { type: String },
});

// Virtual for author's URL
UserSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/gardenofpages/member/${this._id}`;
});

// Export model
module.exports = mongoose.model("User", UserSchema);
