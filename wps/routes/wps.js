const router = require("express").Router();
const cmd = require("node-cmd");
const path = require("path");
const config = require("../../config");
const {postRequest} = require("../utils/requests");

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
			
			console.log("HDFS: file added to " + dir);
			cmd.get(unzip, function(err, data, stderr) {
				//var status = ""
				console.log("Unzip finished")
				console.log(err, stderr);
			});
		} else {
			console.log("HDFS ERROR: unable to get file from " + hdfs_dir);
			console.log(stderr);
			
			//Send finished status but without updating wps
		}
	});
	
	res.json({success: true, 
						ready: false, 
						status: "Busy: extracting geographical data"});
});

router.get("/heartbeat", function(req, res) {
	console.log("WPS: heartbeat");
	res.json({success: true, ready: true, status: "Online"});
});

module.exports = router;