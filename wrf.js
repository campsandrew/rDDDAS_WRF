const express = require("express");
const cmd = require("node-cmd");
const path = require("path");
const querystring = require("querystring");
const http = require("http");
const config = require("./config");

const app = express();

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
//WRF routes
app.use("/wrf/run", run_wrf);
app.use("/wrf/heartbeat", wrf_heartbeat);

//////////
//Catch errors
app.use(function(req, res) {
	res.json({success: false, status: "404 path not found"});
}); 

//////////
//Start WPS service
app.listen(config.wrf.port);

//////////
//Router to run the wps system
function run_wrf(req, res) {
	let wrf_dir = config.wrf.wrf_dir;
	let body = {type: "wrf"};
	let payload = {
		success: true, 
		ready: false, 
		status: "Running WRF"
	};
	
	let hdfs_path = path.join(req.body.wps_output, "*");
	let hdfs_cmd = "hdfs dfs -get " + hdfs_path + " " + wrf_dir;
	cmd.get(hdfs_cmd, function(err, data, stderr) {
		if(!err) {
		
			//TODO: Update namelist based on post data
			
			let real_cmd = "mpirun -np 1 " + path.join(wps_dir, "real.exe");
			console.log("WRF: begin execution");
			cmd.get(real_cmd, function(err, data, stderr) {
				if(!err) {
					//Check for geo_em*
					
					let wrf_cmd = "mpirun -np 1 " + path.join(wps_dir, "wrf.exe");
					console.log("WRF: real.exe ran successfully");
					cmd.get(wrf_cmd, function(err, data, stderr) {
						if(!err) {
							
							console.log("WRF: wrf.exe ran successfully");
							
							// Run hdfs file upload command
							let hdfs_path = config.hdfs.wrfout_dir;
							let dir_path = path.join(wrf_dir, "wrfout*")
							let hdfs_cmd = "hdfs dfs -put -f " + dir_path + " " + hdfs_path;
							cmd.get(hdfs_cmd, function(err, data, stderr) {
								if(!err) {				
									
									// Delete duplicate files
									cmd.run("rm " + dir_path);
									console.log("HDFS: file added " + hdfs_path);
									
									body.status = "WRF Successfully Run";
									body.ready = true;
									body.wrf_output = hdfs_path;
								} else {
									body.status = "ERROR: " + stderr;
									body.ready = false;
									
									console.log("HDFS ERROR: " + stderr);
								}
								
								//Send update status message
								post_request(host, "/node", port, body, function(data) {
									if(!data.success) {
										console.log("ERROR: no response from controller");
									}
								});
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
function wrf_heartbeat(req, res) {
	console.log("WRF: heartbeat");
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