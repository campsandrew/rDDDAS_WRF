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
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use("/", indexRouter);

// Catch errors
app.use(function(req, res) {
	res.json({success: false, status: "404 path not found"});
});

app.listen(config.wps.port);