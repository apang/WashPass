const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// import routes
const routes = require("./routes");

// mount routes
app.use("/api/v1", routes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
