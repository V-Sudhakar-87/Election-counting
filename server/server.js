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
const ENABLE_FETCH = false;   // change later if needed
const UPDATE_DB = false;     // test mode
const DATA_URL = "https://results.eci.gov.in/ResultAcGenNov2025/election-json-S04-live.json";

if (!DATA_URL) {
  console.log("❌ DATA_URL missing");
}

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

    const res = await axios.get(DATA_URL);
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

  cron.schedule("*/7 * * * *", () => {
    fetchAndProcess();
  });
}
  })
  .catch(err => console.log(err));