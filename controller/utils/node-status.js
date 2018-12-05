const fs = require("fs");
const {getRequest} = require("./requests");
const config = require("../../config.js");

function currentStatus(host, type) {
	var stats = allStats();
	return stats[host][type];
}

function updateStatus(host, type, status, ready) {
	var stats = allStats();
	var data;
	
	stats[host][type].status = status;
	stats[host][type].ready = ready;
	
	data = JSON.stringify(stats, null, 2);
	fs.writeFileSync(config.controller.status_path, data);
}

function allStats() {
	var data = fs.readFileSync(config.controller.status_path);
	return JSON.parse(data);
}

function createStatusFile() {
	var stats = {};
	
	//Init WPS components in config
	for(var host of config.wps.nodes) {
		var component = {};
		
		if(!stats.hasOwnProperty(host)) {
			stats[host] = {};
		}
		
		component.status = "Offline";
		component.ready = false;
		
		stats[host]["wps"] = component;
	}
	
	//Init WRF components in config
	for(var host of config.wps.nodes) {
		var component = {};
		
		if(!stats.hasOwnProperty(host)) {
			stats[host] = {};
		}
		
		component.status = "Offline";
		component.ready = false;
		
		stats[host]["wrf"] = component;
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
		let type = "wps";
		
		getRequest(host, url, port, function(data) {
			if(data.success) {
				return updateStatus(host, type, data.status, data.ready);
			}
		});
	});
	
	// Heartbeat status checks for all WRF nodes
	config.wrf.nodes.forEach(function(host) {
		let port = config.wrf.port;
		let url = "/wrf/heartbeat";
		let type = "wrf";
		
		getRequest(host, url, port, function(data) {
			if(data.success) {
				return updateStatus(host, type, data.status, data.ready);
			}
		});
	});
}

module.exports = {allStats, updateStatus, currentStatus, createStatusFile};