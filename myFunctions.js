var CryptoJS = require("crypto-js");
var SHA = CryptoJS.SHA1;
var chalk = require("chalk");

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

function log(string, value) {
	if (typeof value === "object") {
		var display = JSON.stringify(value);
	} else {
		var display = value;
	}
	console.log(chalk.yellow(`\n \n ${string} : \n ${display} \n`));
}

function displayedRoom(room, user) {
	return {
		title: room.title,
		description: room.description,
		photos: room.photos,
		price: room.price,
		city: room.city,
		loc: room.loc,
		user: {
			_id: user._id,
			account: {
				username: user.account.username
			}
		}
	};
}

module.exports = {
	log,
	encrypt,
	badRequestError,
	userAuthorizedData,
	couldntAuthMsg,
	missingToken,
	noOnesToken,
	isEmailConfirmed,
	displayedRoom
};
