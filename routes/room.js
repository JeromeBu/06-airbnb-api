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
	tools.log("req url", req.originalUrl);
	// return res.json({ message: "dans la route api/room", query: req.query });
	var query = {
		city: req.query.city,
		price: { $gt: req.query.priceMin, $lt: req.query.priceMax }
	};
	Room.find(query)
		.count()
		.exec(function(err, count) {
			Room.find(query)
				.populate("user")
				.limit(5)
				.exec(function(err, rooms) {
					if (err) return tools.badRequestError(res, err);
					if (!rooms) return res.send("Couldn't find room with that id");
					res.json({ count: count, rooms: tools.displayedRooms(rooms) });
				});
		});
});

module.exports = roomRouter;
