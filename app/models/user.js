var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
	account: {
		username: {
			type: String,
			required: [true, "User name is required"]
		},
		biography: String
	},
	email: {
		type: String,
		validate: {
			validator: function(value) {
				return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
					value
				);
			},
			message: "This email is not valid"
		},
		required: [true, "Email is required"],
		unique: [true, "Email is already used"]
	},
	token: String,
	hash: String,
	salt: String
});

module.exports = mongoose.model("User", UserSchema);
