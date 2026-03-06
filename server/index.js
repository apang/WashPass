const express = require("express");

const app = express();
const PORT = 5000;

app.get("/api/health", (req, res) => {
  res.json({ status: "WashPass backend is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});