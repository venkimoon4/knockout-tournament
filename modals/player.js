const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  playerName: {
    type: String,
    require: true,
  },
  age: {
    type: Number,
    required: true,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Teams",
  },
});

const Player = mongoose.model("Player", playerSchema);
module.exports = Player;
