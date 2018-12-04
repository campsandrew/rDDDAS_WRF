const chokidar = require("chokidar");
const config = require("../../config");
const cmd = require("node-cmd");
const path = require("path");

var watcher = chokidar.watch(config.controller.watch_path, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
	awaitWriteFinish: {
    pollInterval: 500
  },
	depth: 2
})
.on("addDir", added_directory)
.on("add", added_file)
.on("ready", ready);
	
function added_directory(dir_path) {
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
}

function added_file(dir_path) {
	var file_split = dir_path.split("/").slice(-2);
	
	if(file_split.length == 2) {
		var filename = file_split[1];
		var dir_time = file_split[0].split(/gfs./);
		var dir = dir_time[1].slice(0, 4) + "_" + 
							dir_time[1].slice(4, 6) + "_" +
							dir_time[1].slice(6, 8);
		var hdfs_path = path.join(config.hdfs.data_dir, dir, filename);
		var hdfs_cmd = "hdfs dfs -put " + dir_path + " " + hdfs_path;
		
		// Run hdfs file upload command
		cmd.get(hdfs_cmd, function(err, data, stderr) {
			if(!err) {
				console.log("HDFS: file added " + hdfs_path);
			} else {
				console.log("HDFS ERROR: unable to add file " + hdfs_path);
				//console.log(err);
			}
		});
	}
	
	
	
	
}

function ready() {
	//console.log("Ready")
}
	
module.exports = watcher;