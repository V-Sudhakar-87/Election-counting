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
const ENABLE_FETCH = true;
const UPDATE_DB = true;

// 🔥 ECI LIVE URL
const DATA_URL =
  "https://results.eci.gov.in/ResultAcGenMay2026/election-json-S22-live.json";

const Constituency = require("./models/constituencyModel");

// 🔥 NORMALIZE FUNCTION
const normalize = (str) =>
  str?.toLowerCase().replace(/[^a-z0-9]/g, "");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const electionRoutes = require("./routes/electionRoutes");
app.use("/api", electionRoutes);

// Static
app.use(express.static(path.join(__dirname, "public")));

// 🔥 MAIN FETCH FUNCTION
const fetchAndProcess = async () => {
  try {
    console.log("⏳ Fetching ECI data...");

    const res = await axios.get(DATA_URL, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const raw = res.data;

    const data = raw?.S22?.chartData;

    if (!Array.isArray(data)) {
      console.log("❌ chartData not found");
      return;
    }

    console.log(`✅ Total records: ${data.length}`);

    // 🔥 LOOP ALL DATA
    for (const item of data) {

      const party = item[0];
      const ac_no = item[2];
      const candidateName = item[3];

      console.log(`👉 AC:${ac_no} | Party:${party} | Candidate:${candidateName}`);

      const doc = await Constituency.findOne({ ac_no });

      if (!doc) {
        console.log(`❌ DB missing for AC:${ac_no}`);
        continue;
      }

      // 🔥 RESET ALL
      doc.candidates.forEach(c => c.leading = false);

      // 🔥 MATCH BY NAME
      let leader = doc.candidates.find(c =>
        normalize(c.name) === normalize(candidateName)
      );

      if (leader) {
        console.log(`🟢 NAME MATCH: ${leader.name}`);
      }

      // 🔥 FALLBACK PARTY
      if (!leader) {
        leader = doc.candidates.find(c =>
          normalize(c.party) === normalize(party)
        );

        if (leader) {
          console.log(`🟡 PARTY MATCH: ${leader.name}`);
        }
      }

      // 🔥 SET LEADER
      if (leader) {
        leader.leading = true;
        console.log(`✅ SET LEADING: ${doc.name} → ${leader.name}`);
      } else {
        console.log(`❌ NO MATCH FOUND for ${candidateName}`);
      }

      await doc.save();

      // 🔥 SOCKET EMIT
      const io = app.get("io");
      io.emit("votesUpdated");
    }

    console.log("🔥 UPDATE CYCLE DONE\n");

  } catch (err) {
    console.error("❌ ERROR:", err.message);
  }
};

// 🔥 SERVER + SOCKET
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.set("io", io);

// 🔥 DB CONNECT
mongoose.connect(process.env.MONGO_URI, { dbName: "election_db" })
  .then(() => {
    console.log("✅ MongoDB Connected");

    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });

    if (ENABLE_FETCH) {
      fetchAndProcess();

      // 🔥 every 1 minute
      cron.schedule("*/1 * * * *", () => {
        fetchAndProcess();
      });
    }
  })
  .catch(err => console.log(err));