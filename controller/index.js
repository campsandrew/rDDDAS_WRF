const express = require("express");
const config = require("../config");
const chokidar = require('chokidar');
const indexRouter = require("./routes");

const app = express();

var watcher = chokidar.watch(config.controller.watch_path, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
	awaitWriteFinish: {
    pollInterval: 500
  },
	depth: 5 
});

watcher
  .on('add', function(path) {
		
	})
  .on('ready', function(path) {
		console.log(path)
	})

app.use(express.static("client"));
app.use("/", indexRouter);

app.listen(config.controller.port);