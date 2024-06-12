const { protect, restrictTo } = require("../controllers/authController");
const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const productRoute = require("./productRouter");

const router = require("express").Router();

router
  .route("/")
  .get(getCategories)
  .post(protect, restrictTo("admin"), createCategory);

router
  .route("/:id")
  .get(getCategory)
  .patch(protect, restrictTo("admin"), updateCategory)
  .delete(protect, restrictTo("admin"), deleteCategory);

// mounting
router.use("/:categoryId/products", productRoute);

module.exports = router;
