const express = require("express");

const userRouter = require("./routes/userRouter");
const categoryRouter = require("./routes/categoryRouter");
const productRouter = require("./routes/productRouter");
const orderRouter = require("./routes/orderRouter");
const { globalErrorHandler } = require("./controllers/errorController");

const app = express();

app.use(express.json({ limit: "10kb" }));

app.use("/api/users", userRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

app.use(globalErrorHandler);

module.exports = app;
