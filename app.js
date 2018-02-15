var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var User = require("./app/models/user.js");
var tools = require("./myFunctions");
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/airbnb_api");

var app = express();
var userRouter = require("./routes/user.js");
var coreRouter = require("./routes/core.js");

app.use(logger("dev"));
app.use(bodyParser.json());

app.use("/api/user", userRouter);
app.use("/", coreRouter);

app.listen(3000, function() {
	console.log("Server started");
});
