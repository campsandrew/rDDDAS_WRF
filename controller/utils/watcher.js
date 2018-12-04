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
	
function added_directory(path) {
	var hdfs_cmd = "hdfs dfs -mkdir " + path.join(config.hdfs.data_dir, dir);
	console.log(hdfs_cmd);
	return
	var dir_time = path.split(/gfs./);
	
	if(dir_time.length == 2 && dir_time[1].length == 10) {
		var dir = dir_time[1].slice(0, 4) + "_" + 
							dir_time[1].slice(4, 6) + "_" +
							dir_time[1].slice(6, 8);
		
		cmd.get(hdfs_cmd, function(err, data, stderr) {
			console.log("Make directory call")
			if(!err) {
				console.log("No error")
				console.log(data)
				console.log(stderr)
			} else {
				console.log(err)
			}
		});
	}
}

function added_file(path) {
	console.log("Added " + path)
}

function ready() {
	console.log("Ready")
}
	
module.exports = watcher;