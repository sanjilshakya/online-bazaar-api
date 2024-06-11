const router = require("express").Router();

const { signUp, login } = require("../controllers/authController");

router.post("/signup", signUp);
router.post("/login", login);

router.get("/", (req, res, next) => {
  res.status(200).json({
    status: "success",
  });
});

module.exports = router;
