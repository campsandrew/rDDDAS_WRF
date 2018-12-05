const router = require("express").Router();
const config = require("../../config");

router.get("/", function(req, res) {
	console.log(req.body);
	
	res.json({success: true});
});

module.exports = router;