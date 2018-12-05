const fs = require("fs");
const {getRequest} = require("./requests");
const config = require("../../config.js");

function currentStatus(host) {
	var stats = allStats();
	return stats[host];
}

function updateStatus(host, status, ready) {
	var stats = allStats();
	var data;
	
	stats[host].status = status;
	stats[host].ready = ready;
	data = JSON.stringify(stats, null, 2);
	fs.writeFileSync(config.controller.status_path, data);
}

function allStats() {
	var data = fs.readFileSync(config.controller.status_path);
	return JSON.parse(data);
}

function createStatusFile() {
	var stats = {};
	
	for(var wps of config.wps.nodes) {
		stats[wps] = {};
		stats[wps].type = "WRF";
		stats[wps].status = "Offline";
		stats[wps].ready = false;
	}
	for(var wrf of config.wrf.nodes) {
		stats[wrf] = {};
		stats[wrf].type = "WPS";
		stats[wrf].status = "Offline";
		stats[wrf].ready = false;
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
				return updateStatus(host, data.status, data.ready);
			}
		});
	});
	
	// Heartbeat status checks for all WRF nodes
	config.wrf.nodes.forEach(function(host) {
		let port = config.wrf.port;
		let url = "/wrf/heartbeat";
		
		getRequest(host, url, port, function(data) {
			if(data.success) {
				return updateStatus(host, data.status, data.ready);
			}
		});
	});
}

module.exports = {allStats, updateStatus, currentStatus, createStatusFile};