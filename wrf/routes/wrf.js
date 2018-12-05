const router = require("express").Router();
const config = require("../../config");

router.get("/heartbeat", function(req, res) {
	console.log("WRF: heartbeat")
	res.json({success: true, status: "Online"});
});

module.exports = router;