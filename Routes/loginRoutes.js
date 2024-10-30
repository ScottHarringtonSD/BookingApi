const express = require("express");
const router = express.Router();
const LogInController = require("../Controllers/LoginController");

router.route("/").post(LogInController.login);

module.exports = router;