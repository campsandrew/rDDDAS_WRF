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
	let payload = {
		success: true, 
		ready: false, 
		status: "Running WRF"
	}
	
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