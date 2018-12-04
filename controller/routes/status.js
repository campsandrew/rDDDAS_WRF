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
	
	getRequest(host, loc, port, function(data) {
		return res.json(data);
	});
});

module.exports = router;