var express = require("express");
var chalk = require("chalk");
var User = require("../app/models/user.js");
var CryptoJS = require("crypto-js");
var SHA = CryptoJS.SHA1;
var api_key = "key-ccdd4fc2655e0f1fb4caec6b637cab50";
var DOMAIN = "sandbox4d84c46226e649788b0285d48b7e5156.mailgun.org";
var mailgun = require("mailgun-js")({ apiKey: api_key, domain: DOMAIN });

var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
	res.json({ message: "Welcome to the API" });
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
		salt: salt,
		check_email_token: uid(25)
	};
	log("Body of sign up POST:", userToSave);
	var user = new User(userToSave);
	user.save(function(err, user) {
		if (err) return badRequestError(res, err);
		var data = {
			from: "Excited User <me@samples.mailgun.org>",
			to: user.email,
			subject: "Hello",
			html: `Checking your email, click here to confirme your email: 
      <a href="http://localhost:3000/email_checking/${
				user.check_email_token
			}">Click here</a>`
		};
		mailgun.messages().send(data, function(error, body) {
			log("Mail Error", error);
			log("Mail Body", body);
		});
		log("User saved", user);
		res.json(userAuthorizedData(user));
	});
});

router.route("/user/log_in").post(function(req, res) {
	log("Query", req.body);
	var query = {};
	if (req.body.email) {
		query.email = req.body.email;
	} else {
		query = { "account.username": req.body.username };
	}
	log("Query", query);
	User.findOne(query, function(err, user) {
		log("user", user);
		if (err) return badRequestError(res, err);
		if (!user) return couldntAuthMsg(res);
		var conf = isEmailConfirmed(user, res);
		if (!conf.confirmed) return conf.result;
		if (user.hash !== encrypt(req.body.password, user.salt))
			return couldntAuthMsg(res);
		res.json(userAuthorizedData(user));
	});
});

router.route("/user/:id").get(function(req, res) {
	if (!req.headers.authorization) return missingToken(res);
	var token = req.headers.authorization.split("Bearer ").pop();
	User.findOne({ token: token }, function(err, userAsking) {
		log("user", userAsking);
		if (!userAsking) return noOnesToken(res);
		var conf = isEmailConfirmed(userAsking, res);
		if (!conf.confirmed) return conf.result;
		User.findById(req.params.id, function(req, userAsked) {
			if (!userAsked) {
				return res.send({ message: "Could not find any user with that ID" });
			}
			res.json(userAuthorizedData(userAsked));
		});
	});
	// if (req.headers.authorization) return missingToken(res);
});

function log(string, value) {
	if (typeof value === "object") {
		var display = JSON.stringify(value);
	} else {
		var display = value;
	}
	console.log(chalk.yellow(`\n \n ${string} : \n ${display} \n`));
}

function encrypt(string, salt) {
	return SHA(salt + string).toString(CryptoJS.enc.Base64);
}

function badRequestError(res, err) {
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

function isEmailConfirmed(user, res) {
	if (!user.emailConfirmed) {
		return {
			confirmed: false,
			result: res.send("You need to confirme your mail to get access")
		};
	}
	return { confirmed: true };
}

module.exports = router;
