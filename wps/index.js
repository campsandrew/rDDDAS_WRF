const express = require("express");
const config = require("../config");
const watcher = require("./utils/watcher");

const indexRouter = require("./routes");

const app = express();

app.use(express.static("client"));
app.use("/", indexRouter);

app.listen(config.wps.port);