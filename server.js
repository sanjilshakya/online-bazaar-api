const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const app = require("./app");
const PORT = 3100 || process.env.PORT;

mongoose
  .connect(process.env.DB.replace("<PASSWORD>", process.env.DATABASE_PASSWORD))
  .then(() => {
    console.log("Database connected successfully.");
  });

const server = app.listen(PORT, () => {
  console.log("Server running at port:", PORT);
});
