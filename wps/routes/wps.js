const router = require("express").Router();
const config = require("../../config");

router.post("/new-geog", function(res, req) {
	res.json({});
});

router.get("/heartbeat", function(res, req) {
	console.log("HERE")
	res.json({success: true});
});

module.exports = router;