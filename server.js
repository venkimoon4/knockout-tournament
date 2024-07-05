const express = require("express");
const app = express();
const PORT = 4000;
const db = require("./db.js");
app.use(express.json());
const tournamentRoute = require("./routes/tournament.js");

app.use("/api/tournament", tournamentRoute);

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
