const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  products: [
    {
      product: {
        type: Object,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  orderStatus: {
    type: String,
  },
  payment_status:{
    type: String,
  },
  user: {
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  orderTime: {
    type: String,
  },
});

module.exports = mongoose.model("Order", orderSchema);
