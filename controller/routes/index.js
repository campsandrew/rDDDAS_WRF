const router = require("express").Router();
const statusRouter = require("./status");
const nodesRouter = require("./nodes");

router.use("/status", statusRouter);
router.use("/node", nodesRouter);

module.exports = router;