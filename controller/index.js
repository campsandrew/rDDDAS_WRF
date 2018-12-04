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
  }
});

watcher
  .on('add', path => console.log(`Directory ${path} has been added`))
  .on('unlinkDir', path => console.log(`Directory ${path} has been removed`))
  .on('error', error => console.log(`Watcher error: ${error}`))
  .on('ready', () => console.log('Initial scan complete. Ready for changes'))
  //.on('raw', (event, path, details) => {
    //console.log('Raw event info:', event, path, details);

app.use(express.static("client"));
app.use("/", indexRouter);

app.listen(config.controller.port);