const express = require("express");
const path = require("path");
const chokidar = require("chokidar");
const cmd = require("node-cmd");
const fs = require("fs");
const querystring = require("querystring");
const http = require("http");
const config = require("./config");

const app = express();
const gfs_dir = config.controller.data_watch_path;
const geog_dir = config.controller.geog_watch_path;
const gfs_options = {
	ignored: /(^|[\/\\])\../,
  persistent: true,
	awaitWriteFinish: {
    pollInterval: 500
  },
	depth: 2
};
const geog_options = {
  ignored: /(^|[\/\\])\../,
  persistent: true,
	awaitWriteFinish: {
    pollInterval: 500
  },
	depth: 1
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
app.use(express.static(path.join(__dirname, "client")));
app.use(express.urlencoded({extended: false}));

//////////
//Controller routes
app.use("/status", get_status);
app.use("/node", node_messages);

//////////
//Catch errors
app.use(function(req, res) {
	res.json({success: false, status: "404 path not found"});
}); 

//////////
//Start controller service
app.listen(config.controller.port);

//////////
//Create initial node statuses													 
create_status_file();

/////////
//Initialize watchers
chokidar.watch(gfs_dir, gfs_options)
				.on("addDir", gfs_dir_trigger)
				.on("add", gfs_file_trigger);
chokidar.watch(geog_dir, geog_options)
				.on("add", geog_file_trigger);

//////////
//Incomming node message router
function node_messages(req, res) {
	let host = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	
	// Triggers wrf to run
	if(req.body.hasOwnProperty("wps_output") && req.body.ready) {
		run_wrf(req.body.wps_output);
	}
	
	if(req.body.hasOwnProperty("wrf_output") && req.body.ready) {
		console.log("WRF: successfully receive output from wrf " + req.body.wrf_output);
	}
	
	update_status(host, req.body.type, req.body.status, req.body.ready);
	res.json({success: true});
}

function run_wrf(wps_dir) {
	let random_host = selector("wrf");
	let port = config.wrf.port;
	let body = {
		wps_output: wps_dir
	}
	
	//Trigger WPS controller to begin
	post_request(random_host, "/wrf/run", port, body, function(data) {
		var status = data.success ? data.status : "No response on /wrf/run";
		updateStatus(host, "wrf", data.status, data.ready);
	});
}

/////////
//Status route for client side
function get_status(req, res) {
	let stats = all_stats();
	
	res.json({success: true, stats: stats});
}

/////////
//Gfs directory creation trigger
function gfs_dir_trigger(dir_path) {
	let dir_time = dir_path.split(/gfs./);
	
	// Check for proper file type
	if(dir_time.length == 2 && dir_time[1].length == 10) {
		let dir = dir_time[1].slice(0, 4) + "_" + 
							dir_time[1].slice(4, 6) + "_" +
							dir_time[1].slice(6, 8);
		let hdfs_dir = path.join(config.hdfs.gfs_dir, dir);
		let hdfs_cmd = "hdfs dfs -mkdir " + hdfs_dir;
		
		// Run hdfs directory creation command
		cmd.get(hdfs_cmd, function(err, data, stderr) {
			if(!err) {
				console.log("HDFS: directory created " + hdfs_dir);
			} else {
				console.log("HDFS ERROR: " + stderr);
			}
		});
	}
}

/////////
//Gfs file creation trigger
function gfs_file_trigger(dir_path) {
	let file_split = dir_path.split("/").slice(-2);
	
	//Check for proper file added
	if(file_split.length == 2) {
		let filename = file_split[1];
		let dir_time = file_split[0].split(/gfs./);
		let dir = dir_time[1].slice(0, 4) + "_" + 
							dir_time[1].slice(4, 6) + "_" +
							dir_time[1].slice(6, 8);
		let hdfs_path = path.join(config.hdfs.gfs_dir, dir, filename);
		let hdfs_cmd = "hdfs dfs -put -f " + dir_path + " " + hdfs_path;
		
		// Run hdfs file upload command
		cmd.get(hdfs_cmd, function(err, data, stderr) {
			if(!err) {
				let random_host = selector("wps");
				let port = config.wps.port;
				
				// Delete duplicate files
				cmd.run("rm " + dir_path);
				console.log("HDFS: file added " + hdfs_path);
				
				//Trigger WPS controller to begin
				post_request(random_host, "/wps/run", port, {}, function(data) {
					var status = data.success ? data.status : "No response on /wps/new-geog";
					updateStatus(host, "wps", data.status, data.ready);
				});
			} else {
				console.log("HDFS ERROR: " + stderr);
			}
		});
	}
}

/////////
//Geographical file creation trigger
function geog_file_trigger(dir_path) {
	let filename = dir_path.split("/").slice(-1)[0];
	let filetype = filename.split(".");
	
	// Check to make sure this is a tar file
	if(filetype.indexOf("tar") != -1) {
		let hdfs_path = path.join(config.hdfs.geog_dir, filename);
		let hdfs_cmd = "hdfs dfs -put -f " + dir_path + " " + hdfs_path;

		// Run hdfs file upload command
		cmd.get(hdfs_cmd, function(err, data, stderr) {
			if(!err) {				
				
				// Delete duplicate files
				cmd.run("rm " + dir_path);
				console.log("HDFS: file added " + hdfs_path);
				
				// Loop through all wps nodes
				config.wps.nodes.forEach(function(host) {
					let port = config.wps.port;
					let send = {file: filename};
					
					post_request(host, "/wps/new-geog", port, send, function(data) {
						let status = data.success ? data.status : "No response on /wps/new-geog";
						update_status(host, "wps", data.status, data.ready);
					});
				});
			} else {
				console.log("HDFS ERROR: " + stderr);
			}
		});
	}
}

//////////
//Random node selection module
function module_selector(type) {
	let modules = config[type].nodes;
	
	// Loop through all node modules while available
	while(modules.length > 0) {
		let random = Math.random() * modules.length - 1;
		let ready = currentStatus(modules[random], type);
		
		//If valid status return ip address
		if(ready) {
			return modules[random];
		} else {
			modules.splice(random, 1);
		}
	}
}

//////////
//Get current status of a particular node
function current_status(host, type) {
	let stats = all_stats();
	return stats[host][type].ready;
}

//////////
//Update status of a particular node
function update_status(host, type, status, ready) {
	let stats = all_stats();
	let data;
	
	stats[host][type].status = status;
	stats[host][type].ready = ready;
	
	data = JSON.stringify(stats, null, 2);
	fs.writeFileSync(config.controller.status_path, data);
}

//////////
//Get all status of every node
function all_stats() {
	let data = fs.readFileSync(config.controller.status_path);
	return JSON.parse(data);
}

//////////
//create the initial status file
function create_status_file() {
	let stats = {};
	
	//Init WPS components in config
	for(let host of config.wps.nodes) {
		let component = {};
		
		if(!stats.hasOwnProperty(host)) {
			stats[host] = {};
		}
		
		component.status = "Error";
		component.ready = false;
		
		stats[host]["wps"] = component;
	}
	
	//Init WRF components in config
	for(let host of config.wps.nodes) {
		var component = {};
		
		if(!stats.hasOwnProperty(host)) {
			stats[host] = {};
		}
		
		component.status = "Error";
		component.ready = false;
		
		stats[host]["wrf"] = component;
	}
	
	// Create status file
	data = JSON.stringify(stats, null, 2);
	fs.writeFileSync(config.controller.status_path, data);
	
	// Update initial status of all nodes by sending heartbeat
	initial_status();
}

//////////
//Get node statuses based on heartbeat
function initial_status() {
	
	// Heartbeat status checks for all WPS nodes
	config.wps.nodes.forEach(function(host) {
		let port = config.wps.port;
		let url = "/wps/heartbeat";
		let type = "wps";
		
		get_request(host, url, port, function(data) {
			if(data.success) {
				return update_status(host, type, data.status, data.ready);
			}
		});
	});
	
	// Heartbeat status checks for all WRF nodes
	config.wrf.nodes.forEach(function(host) {
		let port = config.wrf.port;
		let url = "/wrf/heartbeat";
		let type = "wrf";
		
		get_request(host, url, port, function(data) {
			if(data.success) {
				return update_status(host, type, data.status, data.ready);
			}
		});
	});
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