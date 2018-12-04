const router = require("express").Router();
const statusRouter = require("./status");
const nodesRouter = require("./nodes");

router.use("/heartbeat", statusRouter);
router.use("/nodes", nodesRouter);

module.exports = router;