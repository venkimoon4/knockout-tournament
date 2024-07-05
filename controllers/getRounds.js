const Round = require("../modals/rounds.js");

const getRounds = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const findAllRounds = await Round.find({ tournamentId }).populate(
      "matches"
    );

    return res.status(201).json({ rounds: findAllRounds });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = getRounds;
