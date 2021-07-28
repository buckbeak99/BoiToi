const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  copy: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  haveDiscount: {
    type: Boolean,
    default: false,
  },
  discountAmount: {
    type: Number,
    default: true,
  },
  dateExpiration: Date,
  imageUrl: {
    type: String,
    required: true,
  },
  uploadTime: String,
  OrderedAmount: {
    type: Number,
    default: 0,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviews: [
    {
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
    },
  ],
  rating_five: {
    type: Number,
    default: 0,
  },
  rating_four: {
    type: Number,
    default: 0,
  },
  rating_three: {
    type: Number,
    default: 0,
  },
  rating_two: {
    type: Number,
    default: 0,
  },
  rating_one: {
    type: Number,
    default: 0,
  },
  ratingSum: {
    type: Number,
    default: 0,
  },
  avgRating: {
    type: Number,
    default: 0,
  },
});

productSchema.methods.ratingStarFull = function (
  product,
  userName,
  userEmail,
  userReview,
  starReview
) {
  console.log("what prpoduct", this);
  const updatedReviews = [...this.reviews];

  updatedReviews.push({
    name: userName,
    email: userEmail,
    review: userReview,
    rating: starReview,
  });
  this.reviews = updatedReviews;
  // return this.save();

  let quantity = 1;
  let sum = 0;
  let ratingStar;
  switch (starReview) {
    case 5:
      ratingStar = this.rating_five;
      ratingStar += quantity;
      sum = ratingStar * 5;
      this.ratingSum = this.ratingSum + starReview;
      this.rating_five = ratingStar;
      let updatedAvgRating =
        this.ratingSum > 0 ? this.ratingSum / this.reviews.length : 0;
      let intAvgRating = Math.floor(updatedAvgRating);
      this.avgRating = intAvgRating;
      // <% avgRating = product.ratingSum > 0 ?(product.ratingSum/product.reviews.length) : 0 %>
      // <% intAvgRating = Math.floor(avgRating) %>

      return this.save();
      break;
    case 4:
      ratingStar = this.rating_four;
      ratingStar += quantity;
      sum = ratingStar * 4;
      this.ratingSum = this.ratingSum + starReview;
      this.rating_four = ratingStar;
      let updatedAvgRating1 =
        this.ratingSum > 0 ? this.ratingSum / this.reviews.length : 0;
      let intAvgRating1 = Math.floor(updatedAvgRating1);
      this.avgRating = intAvgRating1;
      return this.save();
      break;
    case 3:
      ratingStar = this.rating_three;
      ratingStar += quantity;
      sum = ratingStar * 3;
      this.ratingSum = this.ratingSum + starReview;
      this.rating_three = ratingStar;
      let updatedAvgRating2 =
        this.ratingSum > 0 ? this.ratingSum / this.reviews.length : 0;
        let intAvgRating2 = Math.floor(updatedAvgRating2);
      this.avgRating = intAvgRating2;
      return this.save();
      break;
    case 2:
      ratingStar = this.rating_two;
      ratingStar += quantity;
      sum = ratingStar * 2;
      this.ratingSum = this.ratingSum + starReview;
      this.rating_two = ratingStar;
      let updatedAvgRating3 =
        this.ratingSum > 0 ? this.ratingSum / this.reviews.length : 0;
      let intAvgRating3 = Math.floor(updatedAvgRating3);
      this.avgRating = intAvgRating3;
      return this.save();
      break;
    case 1:
      ratingStar = this.rating_one;
      ratingStar += quantity;
      sum = ratingStar * 1;
      this.ratingSum = this.ratingSum + starReview;
      this.rating_one = ratingStar;
      let updatedAvgRating4 =
        this.ratingSum > 0 ? this.ratingSum / this.reviews.length : 0;
      let intAvgRating4 = Math.floor(updatedAvgRating4);
      this.avgRating = intAvgRating4;
      return this.save();
      break;
    default:
      ratingStar = this.rating_one;
      break;
  }
};

productSchema.methods.addSellQuantity = function (product) {
  console.log("prod model ", this);
  let oldOrderedAmount = this.OrderedAmount;
  let newOrderedAmount = oldOrderedAmount + 1;
  this.OrderedAmount = newOrderedAmount;

  let oldCopyNumber = this.copy;
  let newCopyNumber = oldCopyNumber - 1;
  this.copy = newCopyNumber;
  return this.save();
};

productSchema.methods.addDiscount = function(exDate, newPrice)
{
  let newDiscountEx = exDate;
  let newDiscount = newPrice;
  this.discountAmount = newDiscount;
  this.dateExpiration = newDiscountEx;
  this.haveDiscount = true;
  return this.save();
}
module.exports = mongoose.model("Product", productSchema);
