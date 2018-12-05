const router = require("express").Router();
const statusRouter = require("./status");

router.use("/status", statusRouter);

module.exports = router;