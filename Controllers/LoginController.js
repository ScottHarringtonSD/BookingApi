const { json } = require("express");
const Credentials = require("../Models/Credentials");
const asyncHandler = require("express-async-handler");

// @desc = takes user credentials and returns a token if they match
// @route /login POST
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(401).json({ message: "Please fill in required fields" });
  }

  const loginDetails = await Credentials.findOne({ username }).lean().exec();

  if (loginDetails === null) {
    return res
      .status(401)
      .json({ message: "Incorrect login details provided" });
  }

  if (loginDetails.password !== password) {
    return res
      .status(401)
      .json({ message: "Incorrect login details provided" });
  }

  try {
    const jwt = require("njwt");
    const claims = { iss: "booking-jwt", sub: "AzureDiamond" };
    const token = jwt.create(claims, "booking-token-secret");
    token.setExpiration(new Date().getTime() + 60 * 1000 * 60 * 10);
    return res.status(201).json(  token.compact() );
  } catch {
    return res.status(400).json({
      message: "Something went wrong with your request, please try again",
    });
  }
});

// @desc = checks token is correct
// @route /login/{token} GET
const tokenAuth = asyncHandler(async (req, res) => {
  const jwt = require("njwt");
  const { token } = req.params;
  jwt.verify(token, "booking-token-secret", (err, verifiedJwt) => {
    if (err) {
      res.send(err.message);
    } else {
      res.send(verifiedJwt);
    }
  });
});

module.exports = {
  login,
  tokenAuth,
};