var express = require("express");
var User = require("../app/models/user.js");
var mailgun = require("mailgun-js")({
	apiKey: "key-ccdd4fc2655e0f1fb4caec6b637cab50",
	domain: "sandbox4d84c46226e649788b0285d48b7e5156.mailgun.org"
});
var tools = require("../myFunctions");
var uid = require("uid2");

var userRouter = express.Router();

userRouter.route("/sign_up").post(function(req, res) {
	var salt = uid(10);
	tools.log("uid 10 test", salt);
	var userToSave = {
		account: {
			username: req.body.username,
			biography: req.body.biography
		},
		email: req.body.email,
		token: uid(20),
		hash: tools.encrypt(req.body.password, salt),
		salt: salt,
		check_email_token: uid(25)
	};
	tools.log("Body of sign up POST:", userToSave);
	var user = new User(userToSave);
	user.save(function(err, user) {
		if (err) return tools.badRequestError(res, err);
		var data = {
			from: "Excited User <me@samples.mailgun.org>",
			to: user.email,
			subject: "Hello",
			html: `Checking your email, please confirme your email: 
      <a href="http://localhost:3000/email_checking/${
				user.check_email_token
			}">Click here to confirme your mail</a>`
		};
		mailgun.messages().send(data, function(error, body) {
			tools.log("Mail Error", error);
			tools.log("Mail Body", body);
		});
		tools.log("User saved", user);
		res.json(tools.userAuthorizedData(user));
	});
});

userRouter.route("/log_in").post(function(req, res) {
	tools.log("Query", req.body);
	var query = {};
	if (req.body.email) {
		query.email = req.body.email;
	} else {
		query = { "account.username": req.body.username };
	}
	tools.log("Query", query);
	User.findOne(query, function(err, user) {
		tools.log("user", user);
		if (err) return tools.badRequestError(res, err);
		if (!user) return tools.couldntAuthMsg(res);
		var conf = tools.isEmailConfirmed(user, res);
		if (!conf.confirmed) return conf.result;
		if (user.hash !== tools.encrypt(req.body.password, user.salt))
			return tools.couldntAuthMsg(res);
		res.json(tools.userAuthorizedData(user));
	});
});

userRouter.route("/:id").get(function(req, res) {
	User.findById(req.params.id, function(req, userAsked) {
		if (!userAsked) {
			return res.send({ message: "Could not find any user with that ID" });
		}
		res.json(tools.userAuthorizedData(userAsked));
	});
});

module.exports = userRouter;
