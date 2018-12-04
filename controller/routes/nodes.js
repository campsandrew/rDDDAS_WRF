const router = require("express").Router();
const config = require("../../config");

router.get("/", function(req, res) {
	var payload = {
		wps: {
			nodes: config.wps.nodes,
			port: config.wps.port
		},
		wrf: {
			nodes: config.wrf.nodes,
			port: config.wrf.port
		}
	}
	
	res.json(payload);
});

module.exports = router;