const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  candidate_id: String,
  name: String,
  party: String,
  alliance_name: String,
  votes: Number,
  leading: Boolean,
  winner: Boolean
});

const constituencySchema = new mongoose.Schema({
  _id: String,              // 🔥 VERY IMPORTANT FIX
  name: String,
  ac_no: Number,
  candidates: [candidateSchema],
  total_voters: Number,
  polled_votes: Number,
  result_declared: Boolean
}, {
  collection: "constituencies"
});

module.exports = mongoose.model(
  "Constituency",
  constituencySchema,
  "constituencies"   // 🔥 force correct collection
);