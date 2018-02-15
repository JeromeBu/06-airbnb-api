var express = require("express");
var Room = require("../app/models/room.js");
var tools = require("../myFunctions");

var roomRouter = express.Router();

roomRouter.route("/publish").post(function(req, res) {
	tools.log("req.body dans Post Room publish", req.body);
	var newRoom = new Room({
		title: req.body.title,
		description: req.body.description,
		photos: req.body.photos,
		price: req.body.price,
		city: req.body.city,
		loc: req.body.loc,
		user: req.current_user
	});
	newRoom.save(function(err) {
		if (err) return res.send(err);
		res.json(tools.displayedRoom(newRoom));
	});
});

roomRouter.route("/:id").get(function(req, res) {
	Room.findById(req.params.id)
		.populate("user")
		.exec(function(err, room) {
			if (err) return tools.badRequestError(res, err);
			if (!room) return res.send("Couldn't find room with that id");
			res.json(tools.displayedRoom(room));
		});
});

roomRouter.route(/^\/|$/).get(function(req, res) {
	var filter = {
		price: {
			$gt: parseInt(req.query.priceMin) || 0,
			$lt: parseInt(req.query.priceMax) || 100000
		}
	};

	if (req.query.city) filter.city = req.query.city;
	tools.log("query", filter);

	var latitude = req.query.latitude,
		longitude = req.query.longitude,
		distance = req.query.distance;

	var query = Room.find(filter);

	// if (latitude && longitude && distance) {
	// 	query.where("loc").near({
	// 		center: [longitude, latitude],
	// 		maxDistance: getRadians(10000) // 10 kilomètres
	// 	});
	// }
	// console.log("query :", query);
	// query.count().exec(function(err, count) {
	// 	if (err) return res.send(err);
	// 	query
	// 		.populate("user")
	// 		.limit(5)
	// 		.exec(function(err, rooms) {
	// 			if (err) return tools.badRequestError(res, err);
	// 			if (!rooms) return res.send("Couldn't find rooms");
	// 			console.log("count: ", count);
	// 			console.log("rooms : ", rooms);
	// 			res.json({ count: count, rooms: tools.displayedRooms(rooms) });
	// 		});
	// });

	if (latitude && longitude && distance) {
		query
			.where("loc")
			.near({
				center: [longitude, latitude],
				maxDistance: getRadians(distance) // 10 kilomètres
			})
			.count()
			.exec(function(err, count) {
				if (err) return res.send(err);
				Room.find(filter)
					.where("loc")
					.near({
						center: [longitude, latitude],
						maxDistance: getRadians(10000) // 10 kilomètres
					})
					.populate("user")
					.limit(5)
					.exec(function(err, rooms) {
						if (err) return tools.badRequestError(res, err);
						if (!rooms) return res.send("Couldn't find rooms");
						console.log("count: ", count);
						console.log("rooms : ", rooms);
						res.json({ count: count, rooms: tools.displayedRooms(rooms) });
					});
			});
	} else {
		query.count().exec(function(err, count) {
			Room.find(filter)
				.populate("user")
				.limit(5)
				.exec(function(err, rooms) {
					if (err) return tools.badRequestError(res, err);
					if (!rooms) return res.send("Couldn't find rooms");
					res.json({ count: count, rooms: tools.displayedRooms(rooms) });
				});
		});
	}
});

function getRadians(meters) {
	var km = meters / 1000;
	return km / 111.2;
}

module.exports = roomRouter;
