const router = require("express").Router();
const wrfRouter = require("./wrf");

router.use("/wrf", wrfRouter);

module.exports = router;