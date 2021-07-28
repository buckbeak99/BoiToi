const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  products: [
    {
      Product: {
        type: Object,
      },
    },
  ],
});

categorySchema.methods.clearProduct = function (prodId) {
  const updatedProductsByCategory = this.products.filter((item) => {
    return item.Product[prodId].toString() !== prodId.toString();
  });

  this.products = updatedProductsByCategory;
  return this.save();

};

module.exports = mongoose.model("Category", categorySchema);
