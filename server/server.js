/*require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const cron = require("node-cron");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
// 🔥 CONFIG
const ENABLE_FETCH = false;   // change later if needed
const UPDATE_DB = false;     // test mode
const DATA_URL = "https://results.eci.gov.in/ResultAcGenNov2025/election-json-S04-live.json";

if (!DATA_URL) {
  console.log("❌ DATA_URL missing");
}
const Constituency = require("./models/constituencyModel");

const normalize = (str) =>
  str?.toLowerCase().replace(/[^a-z0-9]/g, "");
// Middleware
app.use(cors());
app.use(express.json());

// Routes
const electionRoutes = require("./routes/electionRoutes");
app.use("/api", electionRoutes);

app.use(express.static(path.join(__dirname, "public")));
// 🔥 FETCH FUNCTION
const fetchAndProcess = async () => {
  try {
    console.log("⏳ Fetching data...");

    const res = await axios.get(DATA_URL, {
  headers: {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json"
  }
});
    const raw = res.data;

    // 🔥 correct path
    const data = raw?.S04?.tableData || raw?.S04?.chartData;

    if (!Array.isArray(data)) {
      console.log("❌ Data not found");
      return;
    }

    console.log("✅ Data fetched");

    // 🔁 LOOP
    for (const item of data) {
      const party = item[0];
      const state = item[1];
      const ac_no = item[2];

      // ❌ candidate name illa intha API la
      console.log(`AC:${ac_no} | Party:${party}`);

      // 🔥 DB UPDATE (LIVE MODE)
      if (UPDATE_DB) {
        const dbConst = await Constituency.findOne({ ac_no });

        if (!dbConst) continue;

        // 👉 party match panna candidate identify pannalam
       const matchedCandidates = dbConst.candidates.filter(
          c => normalize(c.party) === normalize(party)
        );

        // ⚠️ multiple same party irundha skip pannalam
        if (matchedCandidates.length === 1) {
          matchedCandidates[0].leading = true;
        }
      
        await dbConst.save();
      }
    }

    console.log("🔥 Cycle completed\n");

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
};

// 🔥 CREATE SERVER
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// 🔥 MAKE GLOBAL
app.set("io", io);

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI,{ dbName: "election_db" })
  .then(() => {
    console.log("✅ MongoDB Connected");

    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
    if (ENABLE_FETCH) {
  fetchAndProcess(); // 🔥 first run

  cron.schedule("1 * * * *", () => {
    fetchAndProcess();
  });
}
  })
  .catch(err => console.log(err));*/
require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const cron = require("node-cron");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

// 🔥 STATIC
app.use(express.static(path.join(__dirname, "public")));

// 🔥 CONFIG
const DATA_URL =
  "https://results.eci.gov.in/ResultAcGenMay2026/election-json-S22-live.json";

const FETCH_INTERVAL = "*/3 * * * *";

const Constituency = require("./models/constituencyModel");

// 🔥 NORMALIZE
const normalize = (str) =>
  str?.toLowerCase().replace(/[^a-z0-9]/g, "");

// 🔥 MIDDLEWARE
app.use(cors());
app.use(express.json());

// 🔥 ROUTES
const electionRoutes = require("./routes/electionRoutes");
app.use("/api", electionRoutes);

// ==========================
// 🔥 FETCH WITH RETRY (403 SAFE)
// ==========================
async function fetchECIData(retries = 3) {
  try {
    const res = await axios.get(DATA_URL, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://results.eci.gov.in/",
        "Origin": "https://results.eci.gov.in"
      }
    });

    return res.data;

  } catch (err) {

    console.log("⚠️ ECI blocked (retrying)");

    if (retries > 0) {
      await new Promise(r => setTimeout(r, 3000));
      return fetchECIData(retries - 1);
    }

    return null; // 🔥 safe fail
  }
}

// ==========================
// 🔥 MAIN UPDATE LOGIC
// ==========================
let isRunning = false;

async function fetchAndUpdate() {

  if (isRunning) {
    console.log("⏳ Skipping (already running)");
    return;
  }

  isRunning = true;

  try {
    console.log("🔥 Fetching ECI data...");

    const raw = await fetchECIData();

    // 🔥 IMPORTANT FIX (403 safe)
    if (!raw) {
      console.log("❌ Skip update (ECI blocked)");
      return;
    }

    const data = raw?.S22?.chartData;

    if (!Array.isArray(data)) {
      console.log("❌ Invalid data");
      return;
    }

    console.log(`✅ Records: ${data.length}`);

    for (const item of data) {

      const party = item[0];
      const ac_no = item[2];
      const candidateName = item[3];

      const doc = await Constituency.findOne({ ac_no });
      // 🔥 DEBUG TABLE
 console.log("---- MATCH CHECK ----");

  doc.candidates.forEach(c => {

    const nameMatch =
      normalize(c.name) === normalize(candidateName);

    const partyMatch =
      normalize(c.party) === normalize(party);

    console.log({
      DB_Name: c.name,
      NameMatch: nameMatch,
      PartyMatch: partyMatch
    });

  });

      if (!doc) {
        console.log(`❌ Missing AC:${ac_no}`);
        continue;
      }

      // 🔥 RESET
      doc.candidates.forEach(c => c.leading = false);

      // 🔥 STEP 1: STRICT NAME MATCH
      let leader = doc.candidates.find(c =>
        normalize(c.name) === normalize(candidateName)
      );

      // 🔥 STEP 2: LOOSE MATCH (safe fallback)
      if (!leader) {
        leader = doc.candidates.find(c =>
          normalize(c.name).includes(normalize(candidateName))
        );
      }

      // 🔥 STEP 3: PARTY fallback (final safety)
      if (!leader) {
        leader = doc.candidates.find(c =>
          normalize(c.party) === normalize(party)
        );
      }

      // 🔥 SET LEADER
      if (leader) {
        leader.leading = true;
        console.log(`✅ ${doc.name} → ${leader.name}`);
      } else {
        console.log(`❌ NO MATCH → AC:${ac_no} | ${candidateName}`);
      }

      await doc.save();
    }

    console.log("🔥 DB UPDATED");

    // 🔥 SOCKET UPDATE
    const io = app.get("io");
    io.emit("votesUpdated");

  } catch (err) {
    console.error("❌ ERROR:", err.message);
  } finally {
    isRunning = false;
  }
}

// ==========================
// 🔥 SERVER + SOCKET
// ==========================
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.set("io", io);
async function resetAllLeading() {
  console.log("🧹 Resetting all leading flags...");

  await Constituency.updateMany(
    {},
    { $set: { "candidates.$[].leading": false } }
  );

  console.log("✅ All leading set to false");
}
// ==========================
// 🔥 DB CONNECT
// ==========================
mongoose.connect(process.env.MONGO_URI, { dbName: "election_db" })
  .then(() => {

    console.log("✅ MongoDB Connected");
     resetAllLeading();
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });

    // 🔥 FIRST RUN
    fetchAndUpdate();

    // 🔥 CRON RUN
    cron.schedule(FETCH_INTERVAL, fetchAndUpdate);

  })
  .catch(err => console.log(err));