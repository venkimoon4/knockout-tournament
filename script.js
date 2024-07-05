const totalRounds = 4;
let teams = 9;

for (let i = 0; i < totalRounds; i++) {
  let matches = Math.round(teams / 2);
  console.log("round : ", i + 1, ", matches : ", matches);
  teams = Math.floor(teams / 2);
}
