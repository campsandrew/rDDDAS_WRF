const express = require("express");
const config = require("../config");
//const watcher = require("./utils/watcher");
const indexRouter = require("./routes");
const app = express();

app.use(function (req, res, next) {
	res.setHeader('Allow-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});
app.use("/", indexRouter);

app.listen(config.wrf.port);