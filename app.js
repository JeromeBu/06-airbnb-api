var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var uid = require("uid2");
var chalk = require("chalk");
var CryptoJS = require("crypto-js");
var SHA = CryptoJS.SHA1;
var User = require("./app/models/user.js");
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/airbnb_api");

var app = express();
var router = express.Router();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use("/api", router);

app.get("/", function(req, res) {
	res.json({ message: "Welcome to the API, url has to start with /api" });
});

router.get("/", function(req, res) {
	res.json({ message: "Welcome to the API !" });
});

router.route("/user/sign_up").post(function(req, res) {
	var salt = uid(10);
	log("uid 10 test", salt);
	var userToSave = {
		account: {
			username: req.body.username,
			biography: req.body.biography
		},
		email: req.body.email,
		token: uid(20),
		hash: encrypt(req.body.password, salt),
		salt: salt
	};
	log("Body of sign up POST:", userToSave);
	var user = new User(userToSave);
	user.save(function(err, user) {
		if (err) {
			log("error", err);
			return res.status(400).send(err);
		}
		log("User saved", user);
		res.json({
			_id: user._id,
			token: user.token,
			account: user.account
		});
	});
});

console.log("Testing SHA :", encrypt("Hello"));

app.listen(3000, function() {
	console.log("Server started");
});

function encrypt(string, salt) {
	return SHA(salt + string).toString(CryptoJS.enc.Base64);
}

function log(string, value) {
	if (typeof value === "object") {
		var display = JSON.stringify(value);
	} else {
		var display = value;
	}

	console.log(chalk.yellow(`\n \n ${string} : \n ${display} \n`));
}
