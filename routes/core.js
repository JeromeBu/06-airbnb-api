var express = require("express");
var User = require("../app/models/user.js");
var tools = require("../myFunctions");

var coreRouter = express.Router();

coreRouter.get("/api", function(req, res) {
	res.json({ message: "Welcome to the API !" });
});

coreRouter.get("/", function(req, res) {
	res.json({
		message: "Welcome to the API, url has to start with /api to call it"
	});
});

coreRouter.get("/email_checking/:email_token", function(req, res) {
	tools.log("req in email cheking", req.params);
	User.findOne({ check_email_token: req.params.email_token }, function(
		err,
		user
	) {
		tools.log("user in email cheking", user);
		user.emailConfirmed = true;
		user.save(function(err, user) {
			if (err) {
				return res.send(err);
			}
			res.send("Your email has been confirmed");
		});
	});
});

coreRouter.get("*", function(req, res) {
	console.log("404 URL not found");
	res.status(404).json({ error: 404, message: "Page not found" });
});

module.exports = coreRouter;
