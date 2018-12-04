const router = require("express").Router();
const cmd = require("node-cmd");
const config = require("../../config");

router.post("/new-geog", function(req, res) {
	console.log(req);
	console.log("HERE")
	
	
	res.json({success: true});
});

router.get("/heartbeat", function(req, res) {
	res.json({success: true});
});

module.exports = router;