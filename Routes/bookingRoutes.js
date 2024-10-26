const express = require("express");
const router = express.Router();
const bookingController = require("../Controllers/BookingController");

router.route("/").get(bookingController.getAllBookings);
router.route("/").post(bookingController.createNewBooking);
router.route("/").delete(bookingController.deleteBooking);
router.route("/:id").get(bookingController.getBooking);
router.route("/monthly/:year/:month").get(bookingController.getMonthlyBooking);


module.exports = router;
