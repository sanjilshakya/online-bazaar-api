const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is a required field"],
      unique: true,
    },
    description: {
      type: String,
      required: [true, "description is a required field"],
    },
    price: {
      type: Number,
      required: [true, "price is a required field"],
    },
    imagePath: String,
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "product must belong to a category"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  }
  // {
  //   toJSON: { virtuals: true },
  //   toObject: { virtuals: true },
  // }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
