const { json, query } = require("express");
const Booking = require("../Models/Booking");
const asyncHandler = require("express-async-handler");
const { Console } = require("node:console");

// Get all bookings
// route = /bookings GET
const getAllBookings = asyncHandler(async (req, res) => {
  const queryString = require("node:querystring");
  const q = queryString.parse();
  var search = req.query.search;

  if (search) {
    var re = new RegExp(search, "gi");
    const bookings = await Booking.find({
      $or: [
        {
          name: { $regex: re },
        },
        {
          room: { $regex: re },
        },
      ],
    })
      .lean()
      .exec();

    return res.json(bookings);
  }

  if (search === "") {
    return res.json(new Array());
  }

  const bookings = await Booking.find().lean().exec();
  if (!bookings?.length)
    return res.status(400).json({ message: "No booking found" });

  res.json(bookings);
});

// Create new booking
// route = /bookings POST
const createNewBooking = asyncHandler(async (req, res) => {
  const { date, name, room } = req.body;
  if (!date || !name || !room)
    return res.status(400).json({ message: "Please fill in required fields" });

  // checks for same dates and rooms
  const sameDates = await Booking.find({ date }).lean().exec();

  if (sameDates.length > 0) {
    var isDuplicate = false;

    for (var i = 0; i < sameDates.length; i++) {
      if (sameDates[i].room == room) {
        isDuplicate = true;
      }
    }

    if (isDuplicate) {
      return res.status(409).json({
        message:
          "Unfortunately the room is booked, please book another day or another room",
      });
    }
  }

  // create and store the new booking
  const booking = await Booking.create({
    date,
    name,
    room,
  });

  if (booking) return res.status(201).json({ message: "New booking created" });

  res.status(400).json({ message: "Invalid data received" });
});

// @desc Delete booking
// @route Delete /bookings
const deleteBooking = asyncHandler(async (req, res) => {
  const { _id } = req.body;

  if (!_id) return res.status(400).json({ message: "Booking id required" });

  const booking = await Booking.findById(_id).exec();
  if (!booking)
    return res.status(400).json({ message: "Booking id not found" });

  const result = await booking.deleteOne();
  const reply = `Entry deleted successfully: ${result.acknowledged}`;

  res.json(reply);
});

// gets a booking by id
// route get bookings/{_id}
const getBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Booking id required" });

  const booking = await Booking.findById(id).exec();

  if (!booking)
    return res.status(400).json({ message: "Booking id not found" });

  return res.json(booking);
});

module.exports = {
  getAllBookings,
  createNewBooking,
  deleteBooking,
  getBooking,
};
