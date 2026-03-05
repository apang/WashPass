const express = require("express");
const router = express.Router();

const membersRouter = require("./members");
const locationsRouter = require("./locations");

router.use("/members", membersRouter);
router.use("/locations", locationsRouter);

module.exports = router;
