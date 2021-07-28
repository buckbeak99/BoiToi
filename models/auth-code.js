const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const codeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  pass: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
});

module.exports = mongoose.model("AuthCode", codeSchema);
