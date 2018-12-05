const router = require("express").Router();
const config = require("../../config");

router.get("/heartbeat", function(req, res) {
	console.log("WRF: heartbeat");
	res.json({success: true, ready: true, status: "Online"});
});

module.exports = router;