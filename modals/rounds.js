const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Tournament",
  },
  roundNumber: {
    type: Number,
    required: true,
  },
  roundNames: {
    type: String,
  },
  status: {
    type: String,
    enum: ["COMPLETED", "ONGOING"],
    default: "ONGOING",
  },
  teams: [
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
    },
  ],
  oddTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teams",
    default: null,
  },
});

const Round = mongoose.model("Round", roundSchema);
module.exports = Round;
