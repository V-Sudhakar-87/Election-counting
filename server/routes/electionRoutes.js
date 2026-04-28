const express = require("express");
const router = express.Router();

const {
  getAllConstituencies,
  getConstituencyById,
  getResults
} = require("../controllers/electionController");
const { simulateVotes, resetVotes } = require("../controllers/electionController");

router.get("/constituencies", getAllConstituencies);
router.get("/constituency/:id", getConstituencyById);
router.get("/results", getResults);
router.get("/simulate", simulateVotes);
router.get("/reset", resetVotes);

module.exports = router;