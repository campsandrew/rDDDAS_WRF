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
		stats.wps[wps] = "Unknown";
	}
	for(var wrf of config.wrf.nodes) {
		stats.wrf[wrf] = "Unknown";
	}
	
	// Create status file
	data = JSON.stringify(stats, null, 2);
	fs.writeFileSync(config.controller.status_path, data);
	initialStatus();
}

function initialStatus() {
	
	// Heartbeat status checks for all WPS nodes
	config.wps.nodes.forEach(function(host) {
		let port = config.wps.port;
		let url = "/wps/heartbeat";
		
		getRequest(host, url, port, function(data) {
			if(data.success) {
				return updateStatus("wps", host, data.status);
			}
			
			updateStatus("wps", host, "No Response");
		});
	});
	
	// Heartbeat status checks for all WRF nodes
	config.wrf.nodes.forEach(function(host) {
		let port = config.wrf.port;
		let url = "/wrf/heartbeat";
		
		getRequest(host, url, port, function(data) {
			if(data.success) {
				return updateStatus("wrf", host, data.status);
			}
			
			updateStatus("wrf", host, "No Response");
		});
	});
}

module.exports = {allStats, updateStatus, currentStatus, createStatusFile};