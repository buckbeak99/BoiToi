const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const discountSchema = new Schema({
  products: [
    {
      product: {
        type: Object,
        required: true,
      },
      discountAmount: {
        type: Number,
        required: true,
      },
      dateExpiration: Date,
    },
  ],
});

module.exports = mongoose.model("Discount", discountSchema);
