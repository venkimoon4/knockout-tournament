const mongoose = require("mongoose");
const matchSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Tournament",
  },
  roundId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Round",
  },
  matchNumber: {
    type: Number,
    required: true,
  },
  team1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teams",
    default: null,
  },
  team2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teams",
    default: null,
  },
  status: {
    type: String,
    enum: ["COMPLETED", "ONGOING"],
    default: "ONGOING",
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teams",
    default: null,
  },
  nextMatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    default: null,
  },
});

const Match = mongoose.model("Match", matchSchema);

module.exports = Match;
