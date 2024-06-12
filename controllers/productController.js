const Product = require("../models/productModel");
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("./handlerFactory");

exports.getProducts = getAll(Product);

exports.getProduct = getOne(Product);

exports.createProduct = createOne(Product);

exports.updateProduct = updateOne(Product);

exports.deleteProduct = deleteOne(Product);
