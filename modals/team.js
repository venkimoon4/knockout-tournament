const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Tournament",
  },
  teamName: {
    type: String,
    required: true,
  },
  playersIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
});

const Teams = mongoose.model("Teams", teamSchema);
module.exports = Teams;
