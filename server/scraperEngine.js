const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
require("dotenv").config();

const Constituency = require("./models/constituencyModel");

// 🔥 NORMALIZE (same everywhere)
function normalize(str = "") {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

// 🔥 SCRAPED NAME → ID
function toCandidateId(name = "") {
  return normalize(name);
}

// 🔥 SCRAPER
async function scrapeData() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();

  await page.goto("https://tnelections2026.in", {
    waitUntil: "networkidle2",
    timeout: 0
  });

  await page.waitForSelector("table");

  const data = await page.evaluate(() => {

    // 🔥 constituency name try
    const title =
      document.querySelector("h1, h2, .title")?.innerText || "";

    const rows = document.querySelectorAll("table tr");

    const candidates = [];

    rows.forEach((row, i) => {
      if (i === 0) return;

      const cols = row.querySelectorAll("td");
      const values = Array.from(cols).map(td => td.innerText.trim());

      let name = "";
      let party = "";
      let votes = 0;

      values.forEach(v => {

        // ❌ skip time/date
        if (v.match(/AM|PM|\d{1,2}:\d{2}/)) return;

        // ✅ votes
        if (v.match(/^\d{2,}$/)) {
          votes = parseInt(v.replace(/,/g, ""));
          return;
        }

        // ✅ party
        if (v.length <= 6 && v.match(/[A-Z]/)) {
          party = v;
          return;
        }

        // ✅ name
        if (!name && v.length > 3) {
          name = v;
        }

      });

      if (name) {
        candidates.push({ name, party, votes });
      }
    });

    return {
      constituencyName: title,
      candidates
    };
  });

  await browser.close();

  return data;
}

// 🔥 UPDATE DB (STRICT MATCH ONLY)
async function updateDatabase(scraped) {

  const dbConstituencies = await Constituency.find();

  const bulkOps = [];

  let updateCount = 0;
  let skipCount = 0;

  scraped.candidates.forEach(sc => {

    const scId = toCandidateId(sc.name);

    dbConstituencies.forEach(cons => {

      cons.candidates.forEach(c => {

        const dbId = normalize(c.candidate_id);

        if (dbId === scId) {

          // 🔥 ONLY UPDATE IF CHANGED
          if (c.votes !== sc.votes) {

            console.log("🔥 UPDATE:", c.name, "|", cons.name, "|", c.votes, "→", sc.votes);

            bulkOps.push({
              updateOne: {
                filter: {
                  _id: cons._id,
                  "candidates.candidate_id": c.candidate_id
                },
                update: {
                  $set: {
                    "candidates.$.votes": sc.votes
                  }
                }
              }
            });

            updateCount++;

          } else {
            skipCount++;
          }

        }

      });

    });

  });

  if (bulkOps.length > 0) {
    await Constituency.bulkWrite(bulkOps);
    console.log(`🔥 UPDATED: ${updateCount} | ⏭️ SKIPPED: ${skipCount}`);
  } else {
    console.log(`⏭️ No changes | SKIPPED: ${skipCount}`);
  }
}

// 🔥 ENGINE LOOP
async function startEngine() {
  console.log("🚀 Live Election Engine Started...");

  while (true) {
    try {

      // 🔥 1. get all constituencies from DB
      const allCons = await Constituency.find();

      console.log("📍 TOTAL CONSTITUENCIES:", allCons.length);

      // 🔥 2. scrape ONE PAGE (global data)
      const scraped = await scrapeData();

      console.log("📊 Scraped Candidates:", scraped.candidates.length);

      // 🔥 3. update for EACH constituency
      for (const cons of allCons) {

        console.log("🔄 Processing:", cons.name);

        await updateDatabaseForOne(cons, scraped.candidates);

      }

    } catch (err) {
      console.log("❌ ERROR:", err.message);
    }

    const delay = Math.floor(Math.random() * 5000) + 5000;
    console.log(`⏳ Next run in ${delay / 1000}s\n`);

    await new Promise(res => setTimeout(res, delay));
  }
}
async function updateDatabaseForOne(cons, scrapedCandidates) {

  const bulkOps = [];

  let updateCount = 0;

  scrapedCandidates.forEach(sc => {

    const scId = toCandidateId(sc.name);

    cons.candidates.forEach(c => {

      const dbId = normalize(c.candidate_id);

      // 🔥 STRICT MATCH
      if (dbId === scId) {

        // 🔥 ONLY IF CHANGED
        if (c.votes !== sc.votes) {

          console.log(
            "🔥 UPDATE:",
            c.name,
            "|",
            cons.name,
            "|",
            c.votes,
            "→",
            sc.votes
          );

          bulkOps.push({
            updateOne: {
              filter: {
                _id: cons._id,
                "candidates.candidate_id": c.candidate_id
              },
              update: {
                $set: {
                  "candidates.$.votes": sc.votes
                }
              }
            }
          });

          updateCount++;
        }

      }

    });

  });

  if (bulkOps.length > 0) {
    await Constituency.bulkWrite(bulkOps);
    console.log(`✅ ${cons.name} UPDATED: ${updateCount}`);
  }

}

// 🔥 INIT
async function init() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "election_db"
    });

    console.log("✅ Mongo Connected");

    startEngine();

  } catch (err) {
    console.log("❌ Mongo Error:", err.message);
  }
}

init();