var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var User = require("./app/models/user.js");
var Room = require("./app/models/room.js");
var tools = require("./myFunctions");
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/airbnb_api");
var publicRoutes = require("./config/publicRoutes");

var app = express();
var userRouter = require("./routes/user.js");
var roomRouter = require("./routes/room.js");
var coreRouter = require("./routes/core.js");

app.use(logger("dev"));
app.use(bodyParser.json());

app.use("/api", autenticateUser);

app.use("/api/user", userRouter);
app.use("/api/room", roomRouter);
app.use("/", coreRouter);

function autenticateUser(req, res, next) {
	// var routeUrl = publicRoutes.filter(route => route.url === req.originalUrl);
	var routeUrl = publicRoutes.filter(route => {
		var url_regex = RegExp("^" + route.url + ".*$");
		return route.url === req.originalUrl || url_regex.test(req.originalUrl);
	});
	console.log("Public route : ", routeUrl);
	if (routeUrl[0] && routeUrl[0].method === req.method) return next();
	if (!req.headers.authorization) return tools.missingToken(res);
	var token = req.headers.authorization.split("Bearer ").pop();
	User.findOne({ token: token }, function(err, user) {
		if (err) return res.send(err);
		if (!user) return tools.noOnesToken(res);
		var conf = tools.isEmailConfirmed(user, res);
		if (!conf.confirmed) return conf.result;
		req.current_user = user;
		return next();
	});
}

app.listen(3000, function() {
	console.log("Server started");
});
