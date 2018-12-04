const http = require("http");
const querystring = require("querystring");

function getRequest(host, path, port, callback) {
	options = {
		method: "GET",
		host: host,
		path: path,
		port: port,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
  	}
	}
	
	var req = http.request(options, function(res) {
		var body = "";
		
    res.on("data", function(data) {
        body += data;
    });
    res.on("end", function() {
        callback(JSON.parse(body));
    });
	});
	req.end();

  req.on("error", function(e) {
		callback({success: false, error: e});
  });
}

function postRequest(host, path, port, data, callback) {
	var post_data = querystring.stringify(data);

  // An object of options to indicate where to post to
  var post_options = {
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
  var post_req = http.request(post_options, function(res) {
			var body = "";
		
      res.setEncoding("utf8");
      res.on("data", function(data) {
					body += data;
          console.log("Response: " + chunk);
      });
			res.on("end", function() {
					console.log(body)
					callback(body);
			});
  });
	
  // post the data
  post_req.write(post_data);
  post_req.end();
	
	post_req.on("error", function(e) {
		console.log(e);
		callback({success: false, error: e});
	});
}

module.exports = {getRequest, postRequest};