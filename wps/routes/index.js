const router = require("express").Router();
const wpsRouter = require("./wps");

router.use("/wps", wpsRouter);

module.exports = router;