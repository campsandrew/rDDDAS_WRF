const router = require("express").Router();
const config = require("../../config");

router.get("/", function(req, res) {
	var payload = {
		wps: config.wps.nodes,
		wrf: config.wrf.nodes
	}
	
	res.json(payload);
});

module.exports = router;