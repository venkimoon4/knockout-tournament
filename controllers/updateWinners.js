const Match = require("../modals/match.js");
const Round = require("../modals/rounds.js");

const updateWinners = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { winnerId } = req.body;

    const findMatch = await Match.findById(matchId);

    if (!findMatch) {
      return res.status(400).json({ message: "Match not found to update" });
    }

    if (findMatch.status === "COMPLETED") {
      return res.status(400).json({ message: "Match is already updated" });
    }

    const updatedMatch = await Match.findOneAndUpdate(
      { _id: matchId },
      { $set: { winner: winnerId, status: "COMPLETED" } },
      { new: true }
    );

    if (updatedMatch.nextMatchId === null) {
      return res
        .status(400)
        .json({ message: "There is no next match winner is announced" });
    }

    const nextMatch = await Match.findById(updatedMatch.nextMatchId);

    if (!nextMatch) {
      return res.status.json({ message: "next match not found" });
    }

    if (nextMatch.team1 === null) {
      nextMatch.team1 = updatedMatch.winner;
    }
    if (nextMatch.team1.toString() !== updatedMatch.winner.toString()) {
      nextMatch.team2 = updatedMatch.winner;
    }

    await nextMatch.save();

    const findCurrentRound = await Round.findById(
      updatedMatch.roundId
    ).populate("matches");

    if (!findCurrentRound) {
      return res.status(400).json({ message: "Current round not found" });
    }

    if (findCurrentRound) {
      const gotAllWinners = findCurrentRound.matches.every(
        (match) => match.winner
      );
      if (gotAllWinners === true) {
        findCurrentRound.status = "COMPLETED";
        await findCurrentRound.save();
      }
      console.log("WINNERS FROM CURRENT MATCH", gotAllWinners);
    }

    const findNextRound = await Round.findById(nextMatch.roundId).populate(
      "matches"
    );

    if (!findNextRound) {
      return res.status(400).json({ message: "Next round not found" });
    }

    findNextRound.teams.push(updatedMatch.winner);
    await findNextRound.save();

    if (findCurrentRound.status === "COMPLETED") {
      let teams = findNextRound?.teams.length;
      // let matches = findNextRound?.matches;
      console.log("TEAMS LENGTH OF THE NEXT MATCH", teams);
      if (teams % 2 !== 0) {
        let nextMatchId = findNextRound?.matches[0]?.nextMatchId?.toString();
        console.log("next match id ", nextMatchId);
        const lastIndex = findNextRound?.matches.length;
        console.log(
          "last match id : ",
          findNextRound?.matches[lastIndex - 1]?._id?.toString()
        );
        findNextRound.matches[0].nextMatchId =
          findNextRound?.matches[lastIndex - 1]?._id?.toString();
        findNextRound.matches[lastIndex - 1].nextMatchId = nextMatchId;
        await findNextRound?.matches[0].save();
        await findNextRound?.matches[lastIndex - 1].save();
      }
    }

    return res.status(200).json({ updatedMatch, nextMatch, findNextRound });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = updateWinners;
