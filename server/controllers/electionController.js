const Constituency = require("../models/constituencyModel");

// GET ALL
exports.getAllConstituencies = async (req, res) => {
  try {
    const data = await Constituency.find();
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET ONE
exports.getConstituencyById = async (req, res) => {
  try {
    const data = await Constituency.findById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

const allianceToParty = {
  "SPA": "DMK",
  "NDA": "AIADMK",
  "NTK": "NTK",
  "TVK": "TVK"
};
exports.getResults = async (req, res) => {
  try {
    const data = await Constituency.find();

    let partySeats = {};
    let allianceSeats = {};

    // 🔥 NEW (THIS IS WHAT YOU NEED)
    let partyLeadCount = {};
    let allianceLeadCount = {};

    const processed = data.map(cons => {

      let topCandidate = null;

cons.candidates.forEach(c => {
  if (!topCandidate || c.votes > topCandidate.votes) {
    topCandidate = c;
  }
});

      // 🔥 mark leading
      cons.candidates.forEach(c => {
  c.leading = topCandidate && (c.candidate_id === topCandidate.candidate_id);
});

      // 🔥 ONLY ONE COUNT PER CONSTITUENCY
     if (topCandidate && topCandidate.votes > 0) {

  const mainParty =
    allianceToParty[topCandidate.alliance_name] ||
    topCandidate.party; // fallback

  partyLeadCount[mainParty] =
    (partyLeadCount[mainParty] || 0) + 1;

  allianceLeadCount[topCandidate.alliance_name] =
    (allianceLeadCount[topCandidate.alliance_name] || 0) + 1;
}

      return cons;
    });

    // 🔥 FIND LEADING PARTY (BASED ON LEADS)
    let leadingParty = "Waiting";
    let max = 0;

    for (let p in partyLeadCount) {
      if (partyLeadCount[p] > max) {
        max = partyLeadCount[p];
        leadingParty = p;
      }
    }

    res.json({
      constituencies: processed,
      partySeats,
      allianceSeats,

      // 🔥 THIS IS IMPORTANT
      partyLeadCount,
      allianceLeadCount,
      leadingParty
    });

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};
//random vote generation
exports.simulateVotes = async (req, res) => {
  try {
    const io = req.app.get("io");

    const constituencies = await Constituency.find();

    for (let cons of constituencies) {
      cons.candidates.forEach(c => {
        c.votes += Math.floor(Math.random() * 1001) + 1000; // 1000–2000
      });
      await cons.save();
    }

    io.emit("votesUpdated"); // 🔥 push to frontend

    res.json({ message: "Votes simulated 🔥" });

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};
//reset vote 0
exports.resetVotes = async (req, res) => {
  try {
    const io = req.app.get("io");

    const constituencies = await Constituency.find();

    for (let cons of constituencies) {
      cons.candidates.forEach(c => {
        c.votes = 0;
      });
      await cons.save();
    }

    io.emit("votesUpdated");

    res.json({ message: "Votes reset ✅" });

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};