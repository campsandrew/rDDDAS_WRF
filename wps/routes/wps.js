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
	var host = config.controller.host;
	var hdfs_dir = path.join(config.hdfs.geog_dir, file);
	var hdfs_cmd = "hdfs dfs -get " + hdfs_dir + " " + dir;
	var body = {type: "wps"};
	
	// Run hdfs file upload command and unzip new geographical data
	cmd.run("rm -rf " + path.join(dir, "*"));
	cmd.get(hdfs_cmd, function(err, data, stderr) {
		if(!err) {
			var unzip = "tar " + unzipFlags[type] 
												 + " " + path.join(dir, file) 
												 + " -C " + dir
			console.log("HDFS: file added to " + dir);
			
			// Proceed to unzipping files
			cmd.get(unzip, function(err, data, stderr) {
				
				
				if(!err) {
					body.status = "Geographical Data Updated";
					body.ready = true;
				} else {
					body.status = "ERROR: " + stderr;
					body.ready = false;
					console.log("UNZIP ERROR: " + stderr);
				}
				
				//Send status message back to controller
				postRequest(host, "/node", port, body, function(data) {
					if(!data.success) {
						console.log("ERROR: no response from controller");
					}
				});
			});
		} else {
			body.status = "ERROR: " + stderr;
			body.ready = false;
			console.log("HDFS ERROR: " + stderr);
			
			//Send finished status but without updating wps
			postRequest(host, "/node", port, body, function(data) {
				if(!data.success) {
					console.log("ERROR: no response from controller");
				}
			});
		}
	});
	
	res.json({success: true, 
						ready: false, 
						status: "Extracting Geographical Data"});
});

router.get("/heartbeat", function(req, res) {
	console.log("WPS: heartbeat");
	res.json({success: true, ready: true, status: "Online"});
});

module.exports = router;