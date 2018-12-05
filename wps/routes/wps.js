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
	
	// Run hdfs file upload command and unzip new geographical data
	cmd.run("rm -rf " + path.join(dir, "*"));
	cmd.get(hdfs_cmd, function(err, data, stderr) {
		if(!err) {
			var unzip = "tar " + unzipFlags[type] 
												 + " " + path.join(dir, file) 
												 + "-C " + dir
			
			cmd.get(unzip, function(err, data, stderr) {
				console.log(err, stderr);
			});
			console.log("tar " + unzipFlags[type] + " " + path.join(dir, file))
			console.log("HDFS: file added to " + dir);
			
			//Send finished status
		} else {
			console.log("HDFS ERROR: unable to get file from " + hdfs_dir);
			console.log(stderr);
			
			//Send finished status but without updating wps
		}
	});
	
	res.json({success: true, status: "Extracting Geographical Data"});
});

router.get("/heartbeat", function(req, res) {
	console.log("WPS: heartbeat");
	res.json({success: true, status: "Online"});
});

module.exports = router;