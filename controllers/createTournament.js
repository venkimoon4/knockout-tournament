const Tournament = require("../modals/tournament.js");
const Teams = require("../modals/team.js");
const Round = require("../modals/rounds.js");
const Match = require("../modals/match.js");


function shuffleTeams(teams) {
  for (let i = teams.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [teams[i], teams[j]] = [teams[j], teams[i]];
  }
  return teams;
}

function upVsBottom(teams) {
  const middleIndex = Math.ceil(teams.length / 2);
  const topHalf = teams.slice(0, middleIndex);
  const bottomHalf = teams.slice(middleIndex);

  const result = [];
  for (let i = 0; i < Math.max(topHalf.length, bottomHalf.length); i++) {
    if (topHalf[i]) result.push(topHalf[i]);
    if (bottomHalf[i]) result.push(bottomHalf[i]);
  }
  return result;
}

const createTournament = async (req, res) => {
  try {
    const {
      tournamentName,
      sportName,
      format,
      noOfParticipants,
      selectionType,
      fixingType,
    } = req.body;

    // Create new tournament document
    const newTournament = new Tournament({
      tournamentName,
      sportName,
      selectionType,
      format,
      noOfParticipants,
      fixingType,
    });
    const savedTournament = await newTournament.save();

    // Create teams for the tournament
    if (savedTournament.noOfParticipants > 0) {
      for (let i = 0; i < savedTournament.noOfParticipants; i++) {
        let newTeam = new Teams({
          tournamentId: savedTournament._id,
          teamName: `Team ${i + 1}`,
        });
        let saveTeam = await newTeam.save();
      }
    }

    // Find all teams in the tournament
    let findTeams = await Teams.find({ tournamentId: savedTournament._id });

    // Apply fixing type
    if (fixingType === "RANDOM") {
      findTeams = shuffleTeams(findTeams);
    } else if (fixingType === "TOP_VS_BOTTOM") {
      findTeams = upVsBottom(findTeams);
    }

    // Calculate the number of rounds needed
    const totalRounds = Math.ceil(Math.log2(findTeams.length));
    const roundNames = [];

    let roundType = "";
    for (let i = 1; i <= totalRounds; i++) {
      if (i === totalRounds) {
        roundNames.push("Final");
      } else {
        roundType =
          i === totalRounds - 1
            ? "Semi Final"
            : i === totalRounds - 2
            ? "Quarter Final"
            : `Qualification Round ${i}`;
        roundNames.push(roundType);
      }
    }

    let roundNumber = 1;
    let teams = findTeams.length;

    for (let i = 0; i < totalRounds; i++) {
      let newRound = new Round({
        tournamentId: savedTournament._id,
        roundNumber: roundNumber++,
        matches: [],
        teams: [],
        oddTeam: null,
        roundNames: roundNames[i],
      });
      let saveRound = await newRound.save();

      let noOfMatches = Math.round(teams / 2);
      let matchNumber = 1;
      let matchIds = [];

      for (let j = 0; j < noOfMatches; j++) {
        let newMatch = new Match({
          tournamentId: savedTournament?._id,
          roundId: saveRound?._id,
          matchNumber: matchNumber++,
          team1: null,
          team2: null,
        });
        let saveMatch = await newMatch.save();
        matchIds.push(saveMatch._id);
      }

      saveRound.matches = matchIds;
      await saveRound.save();
      teams = Math.floor(teams / 2);
    }

    const findRound1 = await Round.findOne({
      tournamentId: savedTournament._id,
      roundNumber: 1,
    });

    if (!findRound1) {
      return res.status(400).json({ message: "round one not found" });
    }

    const roundOneMatches = await Match.find({ roundId: findRound1._id });

    if (!roundOneMatches) {
      res.status(400).json({ message: "round one matchs not found" });
    }

    // Assign teams to the first-round matches
    let teamIndex = 0;
    for (let i = 0; i < roundOneMatches.length; i++) {
      const match = roundOneMatches[i];
      match.team1 = findTeams[teamIndex++]?._id || null;
      match.team2 = findTeams[teamIndex++]?._id || null;
      await match.save();
      if (match.team1) findRound1.teams.push(match.team1);
      if (match.team2) findRound1.teams.push(match.team2);
    }

    await findRound1.save();

    const findAllRounds = await Round.find({
      tournamentId: savedTournament._id,
    }).populate("matches");

    const roundMatchIdsMap = new Map();

    findAllRounds.forEach((div) => {
      let matches = div.matches.map((div) => div._id.toString());
      roundMatchIdsMap.set(div.roundNumber, matches);
    });

    console.log("MAP", roundMatchIdsMap);

    // Linking nextMatchId to current matches
    for (let round of findAllRounds) {
      let roundMatches = await Match.find({
        _id: roundMatchIdsMap.get(round.roundNumber),
      });

      // referencing next round or match in current match
      let index = 0;
      for (let i = 0; i < roundMatches.length; i += 2) {
        if (roundMatchIdsMap.get(round.roundNumber + 1)) {
          let nextRoundMatchesIds = roundMatchIdsMap.get(round.roundNumber + 1);
          if (index < nextRoundMatchesIds.length) {
            roundMatches[i].nextMatchId = nextRoundMatchesIds[index];
            let refMatch = await roundMatches[i].save();
            if (i + 1 < roundMatches.length) {
              if (roundMatches[i + 1]) {
                roundMatches[i + 1].nextMatchId = nextRoundMatchesIds[index];
                let refMatch2 = await roundMatches[i + 1].save();
              }
            }
          } else {
            roundMatches[i].nextMatchId = null; // no next match
            await roundMatches[i].save();
            if (i + 1 < roundMatches.length) {
              if (roundMatches[i + 1]) {
                roundMatches[i + 1].nextMatchId = null;
                await roundMatches[i + 1].save();
              }
            }
          }
          index += 1;
        }
      }
    }

    const fetchAllRounds = await Round.find({
      tournamentId: savedTournament._id,
    }).populate("matches");

    await fetchAllRounds?.forEach(async (round) => {
      let teams = round?.teams?.length;
      // console.log("HANDLING EVEN MATCHES", teams);
      if (teams % 2 !== 0) {
        let nextMatchId = round?.matches[0]?.nextMatchId?.toString();
        console.log("NEXT MATCH ID", nextMatchId);
        const lastIndex = round?.matches.length;
        console.log(
          "LAST MATCH ID",
          round?.matches[lastIndex - 1]?._id?.toString()
        );
        round.matches[0].nextMatchId =
          round?.matches[lastIndex - 1]?._id?.toString();
        round.matches[lastIndex - 1].nextMatchId = nextMatchId;
        await round?.matches[0].save();
        await round?.matches[lastIndex - 1].save();
      }
    });

    return res
      .status(200)
      .json({ totalRounds, findRound1, roundOneMatches, roundMatchIdsMap });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "internal server error" });
  }
};

module.exports = createTournament;
