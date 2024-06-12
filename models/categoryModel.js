const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is a required field"],
      unique: true,
    },
  }
  // {
  //   toJSON: { virtuals: true },
  //   toObject: { virtuals: true },
  // }
);

// Virtual Populate
// categorySchema.virtual("products", {
//   ref: "Product",
//   foreignField: "category",
//   localField: "_id",
// });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
