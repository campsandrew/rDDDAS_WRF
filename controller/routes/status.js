const router = require("express").Router();
const config = require("../../config");
const {allStats} = require("../utils/node-status");

router.get("/", function(req, res) {
	var stats = allStats();
	
	res.json({success: true, stats: stats});
});

module.exports = router;