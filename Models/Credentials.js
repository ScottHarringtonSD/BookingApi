const { ReturnDocument, Decimal128 } = require("mongodb");
const mongoose = require("mongoose");

const CredentialsSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model("Credential", CredentialsSchema);