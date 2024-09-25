const { ReturnDocument, Decimal128 } = require("mongodb");
const mongoose = require("mongoose");

const BookingSchema = mongoose.Schema({
  date: { type: Date, required: true },
  name: { type: String, required: true },
  room: { type: String, required: true },
});

module.exports = mongoose.model("Booking", BookingSchema);
