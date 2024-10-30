const { json, query } = require("express");
const Booking = require("../Models/Booking");
const asyncHandler = require("express-async-handler");
const { Console } = require("node:console");

// Get all bookings
// route = /bookings GET
const getAllBookings = asyncHandler(async (req, res) => {
  const queryString = require("node:querystring");
  const q = queryString.parse();
  var searchName = req.query.searchName;
  var searchDate = req.query.searchDate;

  if (searchName || searchDate) {
    var re = new RegExp(searchName, "gi");


    if(searchName == ""){
      const bookings = await Booking.find({
        $and: [
          {
            date: searchDate
          },
        ],
      })
        .lean()
        .exec();
  
      return res.json(bookings);
    }
    else if(searchDate == ""){
      const bookings = await Booking.find({
        $and: [
          {
            name: { $regex: re },
          },
        ],
      })
        .lean()
        .exec();
  
      return res.json(bookings);
    }
    else{
    const bookings = await Booking.find({
      $and: [
        {
          name: { $regex: re },
        },
        {
          date: searchDate
        }
      ],
    })
      .lean()
      .exec();

    return res.json(bookings);}
  }

  if (searchName === "" && searchDate === "") {
    return res.json(new Array());
  }

  const bookings = await Booking.find().lean().exec();
  if (!bookings?.length)
    return res.status(404).json({ message: "No booking found" });

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



  if (booking) return res.status(201).json({ message: "New booking created", id: booking._id });

  res.status(400).json({ message: "Invalid data received" });
});

// @desc Delete booking
// @route Delete /bookings
const deleteBooking = asyncHandler(async (req, res) => {
  const jwt = require("njwt");
  let token = "";
  var tokenCheck = false;

  for (let i = 0; i < req.rawHeaders.length; i++) {
    if (req.rawHeaders[i] === "Auth") {
      quotesToken = req.rawHeaders[i + 1];
      token = quotesToken.replace(/^["'](.+(?=["']$))["']$/, "$1");
    }
  }
  await jwt.verify(token, "booking-token-secret", (err, verifiedJwt) => {
    if (err) {
      console.log("failed at token check");
    } else {
      tokenCheck = true;
    }
  });

  if (!tokenCheck) {
    return res.status(401).json({ message: "Token authentication failed" });
  }

  const { id } = req.params;

  if (!id) return res.status(400).json({ message: "Booking id required" });

  const booking = await Booking.findById(id).exec();
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


// Gets the all the bookings in a gieven month
// route get bookings/monthly/year/month
const getMonthlyBooking = asyncHandler(async (req, res) => {
  const { month } = req.params;
  const { year } = req.params;


  var monthStart = new Date(year, month-1, 1);
  var nextMonth = new Date(year, monthStart.getMonth() + 1, 1);



  const bookings = await Booking.find({
    date: {
        $gt: monthStart.toString(),
        $lt: nextMonth.toString()
    }
  }).lean().exec();
  

  

  res.json(bookings);
});

module.exports = {
  getAllBookings,
  createNewBooking,
  deleteBooking,
  getBooking,
  getMonthlyBooking
};
