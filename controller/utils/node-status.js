const fs = require("fs");
const {getRequest} = require("./requests");
const config = require("../../config.js");

function currentStatus(node, host) {
	var stats = allStats();
	return stats[node][host];
}

function updateStatus(node, host, status) {
	var stats = allStats();
	var data;
	
	stats[node][host] = status;
	data = JSON.stringify(stats, null, 2);
	fs.writeFileSync(config.controller.status_path, data);
}

function allStats() {
	var data = fs.readFileSync(config.controller.status_path);
	return JSON.parse(data);
}

function createStatusFile() {
	var stats = {wps: {}, wrf: {}};
	
	for(var wps of config.wps.nodes) {
		stats.wps[wps] = "Unknown"
	}
	for(var wrf of config.wrf.nodes) {
		stats.wrf[wrf] = "Unknown"
	}
	
	// Create status file
	data = JSON.stringify(stats, null, 2);
	fs.writeFileSync(config.controller.status_path, data);
	initialStatus();
}

function initialStatus() {
	var url = "";
	var data;
	var port;
	
	// Update all node statuses for wps
	for(var wps of config.wps.nodes) {
		port = config.wps.port;
		url = "/wps/heartbeat";
		
		getRequest(wps, url, port, function(data) {
			var status = "No Response";
			console.log(data)
			if(data.success) {
				status = data.stutus;
			}
			updateStatus("wps", wps, status);
		});
	}
	
	// Update all node statuses for wrf
	for(var wrf of config.wrf.nodes) {
		port = config.wps.port;
		url = "/wrf/heartbeat";
		
		getRequest(wrf, url, port, function(data) {
			var status = "No Response";
			
			if(data.success) {
				status = data.stutus;
			}
			updateStatus("wrf", wrf, status)
		});
	}
}

module.exports = {allStats, updateStatus, currentStatus, createStatusFile};