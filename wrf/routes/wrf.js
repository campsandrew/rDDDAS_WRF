const router = require("express").Router();
const config = require("../../config");

router.get("/heartbeat", function(req, res) {
	res.json({success: true, status: "Online"});
});

module.exports = router;