var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var uid = require("uid2");
var chalk = require("chalk");
var CryptoJS = require("crypto-js");
var SHA = CryptoJS.SHA1;
var api_key = "key-ccdd4fc2655e0f1fb4caec6b637cab50";
var DOMAIN = "sandbox4d84c46226e649788b0285d48b7e5156.mailgun.org";
var mailgun = require("mailgun-js")({ apiKey: api_key, domain: DOMAIN });
var User = require("./app/models/user.js");
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/airbnb_api");

var app = express();
var router = require("./routes/router.js");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use("/api", router);

app.get("/", function(req, res) {
	res.json({ message: "Welcome to the API, url has to start with /api" });
});

app.get("/email_checking/:email_token", function(req, res) {
	log("req in email cheking", req.params);
	User.findOne({ check_email_token: req.params.email_token }, function(
		err,
		user
	) {
		log("user in email cheking", user);
		user.emailConfirmed = true;
		user.save(function(err, user) {
			if (err) {
				return res.send(err);
			}
			res.send("Your email has been confirmed");
		});
	});
});

app.get("*", function(req, res) {
	res.status(404).send({ error: 404, message: "Page not found" });
});

app.listen(3000, function() {
	console.log("Server started");
});

function log(string, value) {
	if (typeof value === "object") {
		var display = JSON.stringify(value);
	} else {
		var display = value;
	}
	console.log(chalk.yellow(`\n \n ${string} : \n ${display} \n`));
}
