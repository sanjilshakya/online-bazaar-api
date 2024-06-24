const { getAll } = require("../controllers/handlerFactory");
const {
  create,
  findByCartAndProductId,
  update,
  getOne,
} = require("../controllers/shoppingCartController");

const router = require("express").Router();

router.get("/", getAll);

router.get("/:id", getOne);

router.post("/", create);

router.patch("/:id", update);

router.get("/:cartId/product/:productId", findByCartAndProductId);

module.exports = router;
