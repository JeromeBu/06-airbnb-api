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
		res.json(tools.displayedRoom(newRoom, req.current_user));
	});
});

module.exports = roomRouter;
