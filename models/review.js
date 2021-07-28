const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  uploadTime: {
    type: String,
    default: () => moment().format("l, h:mm a"),
  },
  rating: {
    type: Number,
  },
  count: {
    type: Number,
    default: 0,
  },
});

// reviewSchema.Schema.methods.sortReview = function()
// {

// }

module.exports = mongoose.model("Review", reviewSchema);
