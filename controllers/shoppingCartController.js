const ShoppingCart = require("../models/shoppingCartModel");
const catchAsync = require("../utils/catchAsync");
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("./handlerFactory");

exports.getAll = getAll(ShoppingCart, {
  path: "product",
  select: "name price",
});

exports.getOne = getOne(ShoppingCart, {
  path: "product",
  select: "name price",
});

exports.create = createOne(ShoppingCart);

exports.update = updateOne(ShoppingCart);

exports.findByCartAndProductId = catchAsync(async (req, res, next) => {
  const { cartId, productId } = req.params;
  const cart = await ShoppingCart.findOne({
    $and: [{ _id: cartId }, { "product.productId": productId }],
  });

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});
