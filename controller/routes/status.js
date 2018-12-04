const router = require("express").Router();
const config = require("../../config");
const {getRequest} = require("../utils/requests");

router.get("/", function(req, res) {
	if(!req.query.node || !req.query.host) {
		return res.json({message: "Invalid query"});
	}
	
	var loc = "/" + req.query.node + "/heartbeat";
	var host = req.query.host;
	var port = config[req.query.node].port;
	var payload = {};
	
	getRequest(host, loc, port, function(data) {
		console.log(data);
		
		return res.send("TEST");
	});
});

module.exports = router;