var mongoose = require("mongoose");
// var uniqueValidator = require("mongoose-unique-validator");

var roomSchema = mongoose.Schema({
	title: String,
	description: String,
	photos: [String],
	price: Number,
	ratingValue: { type: Number, default: null },
	reviews: { type: Number, default: 0 },
	city: String,
	loc: {
		type: [Number], // Longitude et latitude
		index: "2d" // Créer un index geospatial https://docs.mongodb.com/manual/core/2d/
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}
});

// roomSchema.plugin(uniqueValidator, { message: "{PATH} is already taken" });

module.exports = mongoose.model("Room", roomSchema);
