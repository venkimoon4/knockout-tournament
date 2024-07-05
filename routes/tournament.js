const express = require("express");
const createTournament = require("../controllers/createTournament");
const updateWinners = require("../controllers/updateWinners");
const getRounds = require("../controllers/getRounds");
const createTeam = require("../controllers/createTeam");
const deleteTeam = require("../controllers/deleteTeam");
const router = express.Router();

router.post("/createTournament", createTournament);
router.put("/updateWinners/:matchId", updateWinners);
router.get("/getAllRounds/:tournamentId", getRounds);
router.post("/addTeam/:tournamentId", createTeam);
router.delete("/deleteTeam/:id", deleteTeam);

module.exports = router;
