const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema({
  tournamentName: {
    type: String,
    require: true,
  },
  sportName: {
    type: String,
    required: true,
  },
  selectionType: {
    type: String,
    enum: ["TEAM", "INDIVIDUAL"],
    required: true,
  },
  fixingType: {
    type: String,
    required: true,
  },
  noOfParticipants: {
    type: Number,
    required: true,
  },
  format: {
    type: String,
    required: true,
  },
});

const Tournament = mongoose.model("Tournament", tournamentSchema);

module.exports = Tournament;
