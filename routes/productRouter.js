const { protect, restrictTo } = require("../controllers/authController");
const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = require("express").Router({ mergeParams: true });

router
  .route("/")
  .get(getProducts)
  .post(protect, restrictTo("admin"), createProduct);

router
  .route("/:id")
  .get(getProduct)
  .patch(protect, restrictTo("admin"), updateProduct)
  .delete(protect, restrictTo("admin"), deleteProduct);

module.exports = router;
