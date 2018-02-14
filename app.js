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
		if (err) return badRequestError(res, err);
		log("User saved", user);
		res.json(userAuthorizedData(user));
	});
});

router.route("/user/log_in").post(function(req, res) {
	req.body;
	User.findOne({ email: req.body.email }, function(err, user) {
		log("user", user);
		if (err) return badRequestError(res, err);
		if (!user) return couldntAuthMsg(res);
		if (user.hash !== encrypt(req.body.password, user.salt)) {
			return couldntAuthMsg(res);
		}
		res.json(userAuthorizedData(user));
	});
});

router.route("/user/:id").get(function(req, res) {
	if (!req.headers.authorization) return missingToken(res);
	var token = req.headers.authorization.split("Bearer ").pop();
	User.findOne({ token: token }, function(err, userAsking) {
		if (!userAsking) return noOnesToken(res);
		User.findById(req.params.id, function(req, userAsked) {
			if (!userAsked)
				return res.send({ message: "Could not find any user with that ID" });
			res.json({ userAsked: userAsked });
		});
	});
	// if (req.headers.authorization) return missingToken(res);
});

app.get("*", function(req, res) {
	res.status(404).send({ error: 404, message: "Page not found" });
});

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

function badRequestError(res, err) {
	log("error", err);
	return res.status(400).send(err);
}

function userAuthorizedData(user) {
	return {
		_id: user._id,
		token: user.token,
		account: user.account
	};
}

function couldntAuthMsg(res) {
	return res
		.status(401)
		.send("Could not authenticate: password or email is not correct");
}

function missingToken(res) {
	return res.send({
		error: {
			code: 48326,
			message: "Invalid token (missing)"
		}
	});
}

function noOnesToken(res) {
	return res.send({
		error: {
			code: 9473248,
			message: "Invalid token (belong to no one)"
		}
	});
}
