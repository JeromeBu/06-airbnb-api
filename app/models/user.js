var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

var userSchema = new mongoose.Schema({
	account: {
		username: {
			type: String,
			required: [true, "User name is required"],
			unique: true
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
		unique: true
	},
	token: String,
	hash: String,
	salt: String,
	check_email_token: String,
	emailConfirmed: {
		type: Boolean,
		default: false
	}
});

userSchema.plugin(uniqueValidator, { message: "{PATH} is already taken" });

module.exports = mongoose.model("User", userSchema);
