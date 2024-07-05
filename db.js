const mongoose = require("mongoose");

const mongoDBURL = "mongodb://127.0.0.1:27017/testtourDB?";

mongoose.connect(mongoDBURL);

const db = mongoose.connection;
db.on("connected", () => {
  console.log("Connected mongodb server successfully");
});
db.on("disconnected", () => {
  console.log("mongodb sever disconnected");
});
db.on("error", (error) => {
  console.log("error in connecting mongodb server", error);
});

module.exports = db;
