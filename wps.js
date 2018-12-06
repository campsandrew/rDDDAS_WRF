const express = require("express");
const cmd = require("node-cmd");
const path = require("path");
const querystring = require("querystring");
const http = require("http");
const config = require("./config");

const app = express();
const unzipFlags = {
	bz2: "-jxf",
	gz: "-zxf"
};

/////////
//Server settings
app.use(function (req, res, next) {
	res.setHeader('Allow-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//////////
//WPS routes
app.use("/wps/run", run_wps);
app.use("/wps/new-geog", update_geog_data);
app.use("/wps/heartbeat", wps_heartbeat);

//////////
//Catch errors
app.use(function(req, res) {
	res.json({success: false, status: "404 path not found"});
}); 

//////////
//Start WPS service
app.listen(config.wps.port);

//////////
//Router for geographical data change
function update_geog_data(req, res) {
	let file = req.body.file;
	let type = file.split(".").slice(-1)[0].toLowerCase();
	let dir = config.wps.geog_dir;
	let host = config.controller.host;
	let port = config.controller.port;
 	let hdfs_dir = path.join(config.hdfs.geog_dir, file);
	let hdfs_cmd = "hdfs dfs -get " + hdfs_dir + " " + dir;
	let body = {type: "wps"};
	let payload = {
		success: true, 
		ready: false, 
		status: "Extracting Geographical Data"
	}
	
	// Run hdfs file upload command and unzip new geographical data
	cmd.run("rm -rf " + path.join(dir, "*"));
	cmd.get(hdfs_cmd, function(err, data, stderr) {
		if(!err) {
			let unzip = "tar " + unzipFlags[type] 
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
				post_request(host, "/node", port, body, function(data) {
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
			post_request(host, "/node", port, body, function(data) {
				if(!data.success) {
					console.log("ERROR: no response from controller");
				}
			});
		}
	});
	
	//Send message back letting controller know
	//that message was received
	res.json(payload);
}

//////////
//Router to run the wps system
function run_wps(req, res) {
	let geog_log = path.join(wps_dir, config.wps.geogrid_log);
	let ungrib_log = path.join(wps_dir, config.wps.ungrib_log);
	let metgrid_log = path.join(wps_dir, config.wps.metgrid_log);
	let vtable = path.join(wps_dir, "ungrib/Varibale_Table.GFS");
	let wps_dir = config.wps.wps_dir;
	let gfs_data = config.wps.gfs_dir;
	let payload = {
		success: true, 
		ready: false, 
		status: "Running WPS"
	};
	
	//TODO: Update namelist based on post data
	
	let command = path.join(wps_dir, "geogrid.exe") + " > " + geog_log;
	console.log("WPS: begin execution");
	cmd.get(command, function(err, data, stderr) {
		if(!err) {
			//Check for geo_em*
			
			let link_cmd = path.join(wps_dir, "link_grib.csh") + " " + gfs_data;
			console.log("WPS: geogrid.exe ran successfully");
			cmd.get(link_cmd, function(err, data, stderr) {
				if(!err) {
					
					let link_vtable = "ln -sf " + vtable + " " + path.join(wps_dir, "Vtable")
					console.log("WPS: grib linked successfully");
					cmd.get(link_vtable, function(err, data, stderr) {
						if(!err) {
							
							let ungrib_cmd = path.join(wps_dir, "ungrib.exe") + " > " + ungrib_log;
							console.log("WPS: vtables linked successfully");
							cmd.get(ungrib_cmd, function(err, data, stderr) {
								if(!err) {
									//check for FILE prefix files from namelist.wps
									
									let metgrid_cmd = path.join(wps_dir, "metgrid.exe") + " > " + metgrid_log;
									console.log("WPS: ungrib.exe ran successfully");
									cmd.get(metgrid_cmd, function(err, data, stderr) {
										if(!err) {
											//check for met_em* files
											
											console.log("WPS: metgrid ran successfully");
											
											//Send update status message
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
	
	//Send message back letting controller know
	//that message was received
	res.json(payload);
}

//////////
//Router to heartbeat check wps system
function wps_heartbeat(req, res) {
	console.log("WPS: heartbeat");
	res.json({success: true, ready: true, status: "Online"});
}

//////////
//Send a get request
function get_request(host, path, port, callback) {
	let options = {
		method: "GET",
		host: host,
		path: path,
		port: port,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
  	}
	}
	
	let req = http.request(options, function(res) {
		let body = "";
		
		// Incoming data trigger
    res.on("data", function(data) {
        body += data;
    });
		
		// End of data trgger
    res.on("end", function() {
    	callback(JSON.parse(body));
    });
	});
	req.end();

	// Request error trigger
  req.on("error", function(e) {
		callback({success: false, status: "Error", error: e});
  });
}

//////////
//Send a post request
function post_request(host, path, port, data, callback) {
	let post_data = querystring.stringify(data);
  let options = {
      host: host,
      port: port,
      path: path,
      method: "POST",
      headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(post_data)
      }
  };

  // Set up the request
  let req = http.request(options, function(res) {
			let body = "";
		
      res.setEncoding("utf8");
			
			// Incoming data trigger
      res.on("data", function(data) {
					body += data;
      });
			
			// End of data trgger
			res.on("end", function() {
					callback(JSON.parse(body));
			});
  });
	
  // post the data to location
  req.write(post_data);
  req.end();
	
	// Request error trigger
	req.on("error", function(e) {
		callback({success: false, status: "Error", error: e});
	});
}