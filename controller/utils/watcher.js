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
		var date
		var hdfs_dir = path.join(config.hdfs.data_dir, dir);
		var hdfs_cmd = "hdfs dfs -mkdir " + hdfs_dir;
		
		cmd.get(hdfs_cmd, function(err, data, stderr) {
			console.log("Make directory call")
			if(!err) {
				console.log("HDFS: directory created " + hdfs_dir);
			} else {
				console.log(err.Error);
			}
		});
	}
}

function added_file(dir_path) {
	console.log("Added " + dir_path)
}

function ready() {
	console.log("Ready")
}
	
module.exports = watcher;