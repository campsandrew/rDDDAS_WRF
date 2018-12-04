const router = require("express").Router();
const cmd = require("node-cmd");
const path = require("path");
const config = require("../../config");

const unzipFlags = {
	bz2: "-jxf",
	gz: "-zxf"
};

router.post("/new-geog", function(req, res) {
	var file = req.body.file;
	var type = file.split(".").slice(-1)[0].toLowerCase();
	var dir = config.wps.geog_dir;
	var hdfs_dir = path.join(config.hdfs.geog_dir, file);
	var hdfs_cmd = "hdfs dfs -get " + hdfs_dir + " " + dir;
	
	// Run hdfs file upload command
	cmd.get(hdfs_cmd, function(err, data, stderr) {
		if(!err) {
			console.log("HDFS: file added to " + dir);
		} else {
			console.log("HDFS ERROR: unable to get file from " + hdfs_dir);
			console.log(stderr);
		}
	});
	
	res.json({success: true});
});

router.get("/heartbeat", function(req, res) {
	res.json({success: true});
});

module.exports = router;