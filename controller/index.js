const express = require("express");
const config = require("../config");
const chokidar = require('chokidar');
const indexRouter = require("./routes");

const app = express();

var watcher = chokidar.watch(config.controller.watch_path, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
	awaitWriteFinish: {
    stabilityThreshold: 5000,
    pollInterval: 600
  },
	depth: 5 
});

watcher
  .on('change', path => console.log(`Directory ${path} has been added`))
  .on('error', error => console.log(`Watcher error: ${error}`))
  .on('ready', () => console.log('Initial scan complete. Ready for changes'))

app.use(express.static("client"));
app.use("/", indexRouter);

app.listen(config.controller.port);