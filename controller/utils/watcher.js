const chokidar = require("chokidar");
const cmd = require("node-cmd");
const path = require("path");
const config = require("../../config");
const {postRequest} = require("./requests");

// Data watcher for WRF
var data_watcher = chokidar.watch(config.controller.data_watch_path, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
	awaitWriteFinish: {
    pollInterval: 500
  },
	depth: 2
})
.on("addDir", function(dir_path) {
	var dir_time = dir_path.split(/gfs./);
	
	if(dir_time.length == 2 && dir_time[1].length == 10) {
		var dir = dir_time[1].slice(0, 4) + "_" + 
							dir_time[1].slice(4, 6) + "_" +
							dir_time[1].slice(6, 8);
		var hdfs_dir = path.join(config.hdfs.data_dir, dir);
		var hdfs_cmd = "hdfs dfs -mkdir " + hdfs_dir;
		
		// Run hdfs directory creation command
		cmd.get(hdfs_cmd, function(err, data, stderr) {
			if(!err) {
				console.log("HDFS: directory created " + hdfs_dir);
			} else {
				console.log("HDFS ERROR: directory already exists " + hdfs_dir);
				//console.log(err);
			}
		});
	}
})
.on("add", function(dir_path) {
	var file_split = dir_path.split("/").slice(-2);
	
	if(file_split.length == 2) {
		var filename = file_split[1];
		var dir_time = file_split[0].split(/gfs./);
		var dir = dir_time[1].slice(0, 4) + "_" + 
							dir_time[1].slice(4, 6) + "_" +
							dir_time[1].slice(6, 8);
		var hdfs_path = path.join(config.hdfs.data_dir, dir, filename);
		var hdfs_cmd = "hdfs dfs -put -f " + dir_path + " " + hdfs_path;
		
		// Run hdfs file upload command
		cmd.get(hdfs_cmd, function(err, data, stderr) {
			if(!err) {
				console.log("HDFS: file added " + hdfs_path);
				cmd.run("rm " + dir_path);
			} else {
				console.log("HDFS ERROR: unable to add file " + hdfs_path);
				//console.log(err);
			}
		});
	}
});

// Geog watcher for WPS
var geog_watcher = chokidar.watch(config.controller.geog_watch_path, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
	awaitWriteFinish: {
    pollInterval: 500
  },
	depth: 1
})
.on("add", function(dir_path) {
	var filename = dir_path.split("/").slice(-1)[0];
	var filetype = filename.split(".");
	
	if(filetype.indexOf("tar") != -1) {
		var hdfs_path = path.join(config.hdfs.geog_dir, filename);
		var hdfs_cmd = "hdfs dfs -put -f " + dir_path + " " + hdfs_path;

		// Run hdfs file upload command
		cmd.get(hdfs_cmd, function(err, data, stderr) {
			if(!err) {
				var port = config.wps.port;
				var send = {file: filename};
				
				console.log("HDFS: file added " + hdfs_path);
				cmd.run("rm " + dir_path);
				
				// Send message to wps nodes to update geographical data
				for(var wps of config.wps.nodes) {
					postRequest(wps, "/wps/new-geog", port, send, function(data) {
						if(data.success) {
							console.log("WPS: " + wps  + "successfully updated geographical data");
						} else {
							console.log("WPS: " + wps  + "failed to updatd geographical data");
						}
					});
				}
			} else {
				console.log("HDFS ERROR: unable to add file " + hdfs_path);
				//console.log(err);
			}
		});
	}
});

module.exports = {data_watcher, geog_watcher};