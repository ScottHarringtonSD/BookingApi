const mongoose = require("mongoose");
const options = {
  dbName: "BookingSystem",
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING, options);
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
