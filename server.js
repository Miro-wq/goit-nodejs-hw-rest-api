const mongoose = require("mongoose");
require("dotenv").config();
const app = require("./app");

const DB_HOST = process.env.DB_HOST;

mongoose
  .connect(DB_HOST)
  .then(() => {
    console.log("Database connection successful");
    app.listen(3000, () => {
      console.log("Server is running. Use our API on port: 3000");
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error.message);
    process.exit(1);
  });
