const router = require("express").Router();
const config = require("../../config");
const {updateStatus} = require("../utils/node-status");

router.post("/", function(req, res) {
	var host = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	
	updateStatus(host, req.body.type, req.body.status, req.body.ready);
	res.json({success: true});
});

module.exports = router;