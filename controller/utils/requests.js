const http = require("http");

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
					
    res.on("data", function(d) {
        body += d;
    });
    res.on("end", function() {
        var parsed = JSON.parse(body);
				
        callback(parsed);
    });
	});
	
	req.setTimeout(6000, function() {
    req.abort();
	});
	req.end();

  req.on("error", function(e) {
		callback({success: false, error: e});
  });
}

module.exports = {getRequest};