const mongoose = require("mongoose");

const shoppingCartSchema = new mongoose.Schema({
  dateCreated: {
    type: Date,
  },
  userId: { type: String },
  product: [
    // { type: mongoose.Schema.ObjectId, ref: "Product"},
  ],
});

// shoppingCartSchema.pre(/$find/, function (next) {
//   this.populate({
//     path: "product",
//     select: "name price",
//   });
// });

const ShoppingCart = mongoose.model("ShoppingCart", shoppingCartSchema);

module.exports = ShoppingCart;
