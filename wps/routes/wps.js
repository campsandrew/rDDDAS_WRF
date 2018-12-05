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
	var port = config.controller.port;
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
			console.log("HDFS: file added " + path.join(dir, file));
			
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

// Run WPS
router.post("/run", function(req, res) {
	var command = "";
	var wps_dir = config.wps.wps_dir;
	var geog_log = path.join(wps_dir, config.wps.geogrid_log);
	var ungrib_log = path.join(wps_dir, config.wps.ungrib_log);
	var metgrid_log = path.join(wps_dir, config.wps.metgrid_log);
	var gfs_data = config.wps.gfs_dir;
	var vtable = path.join(wps_dir, "ungrib/Varibale_Table.GFS");
	//TODO: Update namelist based on post data
	
	console.log("WPS: begin execution");
	command = path.join(wps_dir, "geogrid.exe") + " > " + geog_log;
	cmd.get(command, function(err, data, stderr) {
		if(!err) {
			//Check for geo_em*
			
			
			var link_cmd = path.join(wps_dir, "link_grib.csh") + " " + gfs_data;
			
			console.log("WPS: geogrid.exe ran successfully");
			cmd.get(link_cmd, function(err, data, stderr) {
				console.log(err);
				if(!err) {
					var link_vtable = "ln -sf " + vtable + " " + path.join(wps_dir, "Vtable")
					
					console.log("WPS: grib linked successfully");
					cmd.get(link_vtable, function(err, data, stderr) {
						if(!err) {
							var ungrib_cmd = path.join(wps_dir, "ungrib.exe") + " > " + ungrib_log;
							
							console.log("WPS: vtables linked successfully");
							cmd.get(ungrib_cmd, function(err, data, stderr) {
								if(!err) {
									//check for FILE prefix files from namelist.wps
									
									var metgrid_cmd = path.join(wps_dir, "metgrid.exe") + " > " + metgrid_log;
									
									console.log("WPS: ungrib.exe ran successfully");
									cmd.get(metgrid_cmd, function(err, data, stderr) {
										if(!err) {
											//check for met_em* files
											
											console.log("WPS: metgrid ran successfully");
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
	
	res.json({success: true, ready: false, status: "Running WPS"});
});

// WPS heartbeat
router.get("/heartbeat", function(req, res) {
	console.log("WPS: heartbeat");
	res.json({success: true, ready: true, status: "Online"});
});

module.exports = router;