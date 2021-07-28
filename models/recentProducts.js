const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recentProductSchema = new Schema({
  product: {
    type: Object,
    required: true,
  },
});

// recentProductSchema.methods.addToRecent = function (prod) {
//   const updatedProducts = [...this];
//   updatedProducts.push(prod);
//   this.products = updatedProducts;
//   return this.save();
// };

module.exports = mongoose.model("RecentProduct", recentProductSchema);
