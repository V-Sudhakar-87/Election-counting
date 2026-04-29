

console.log("🔥 map.js loaded");

// ==========================
// CHECK TOPO LOAD
// ==========================
if (!tnMapTopo || !tnMapTopo.objects) {
  console.error("❌ TopoJSON not loaded properly");
}

console.log("TOPO OBJECTS:", tnMapTopo.objects);

// ==========================
// SVG SETUP
// ==========================
const width = 800;
const height = 600;

const svg = d3.select("#tnMap")
  .attr("viewBox", `0 0 ${width} ${height}`);

// ==========================
// GEO DATA
// ==========================
const geoData = topojson.feature(
  tnMapTopo,
  tnMapTopo.objects["tn_ac_2021"]
);

console.log("🗺️ GEO SAMPLE:", geoData.features[0].properties);

// ==========================
// PROJECTION
// ==========================
const projection = d3.geoMercator().fitSize(
  [width, height],
  geoData
);

const path = d3.geoPath().projection(projection);

// ==========================
// DRAW MAP
// ==========================
const g = svg.append("g");
g.selectAll("path")
  .data(geoData.features)
  .enter()
  .append("path")
  .attr("d", path)
  .attr("class", "constituency")
  .attr("fill", "#ccc")
  .style("cursor", "pointer")
  .style("pointer-events", "all") // 🔥 MUST
  .on("click", function(event, d) {
    console.log("🖱️ CLICKED PATH:", d.properties);
    handleClick(d);
  });

/* const zoom = d3.zoom()
  .scaleExtent([1, 6])
  .on("zoom", (event) => {
    g.attr("transform", event.transform); // 🔥 apply to group
  });*/
const zoom = d3.zoom()
  .scaleExtent([1, 6])   // zoom limit
  .translateExtent([[0, 0], [width, height]]) // 🔥 STOP moving outside
  .extent([[0, 0], [width, height]])          // 🔥 viewport fix
  .on("zoom", (event) => {
    g.attr("transform", event.transform);
  });
// ❌ disable scroll zoom
svg.call(zoom).on("wheel.zoom", null);

function zoomIn() {
  svg.transition().call(
    zoom.scaleBy, 1.3, [width / 2, height / 2]
  );
}

function zoomOut() {
  svg.transition().call(
    zoom.scaleBy, 0.7, [width / 2, height / 2]
  );
}

/*svg.call(
  zoom.transform,
  d3.zoomIdentity.translate(0, 0).scale(1)
);*/
svg.call(zoom).call(
  zoom.transform,
  d3.zoomIdentity
    .translate(0, 0)
    .scale(1)
);

// ==========================
// GLOBAL DATA
// ==========================
let constituencyData = [];

// ==========================
// ALLIANCE COLORS 🔥
// ==========================
const allianceColors = {
  SPA: "#e11d48",   // DMK
  NDA: "#16a34a",   // AIADMK + BJP
  NTK: "#7f1d1d",
  TVK: "#f59e0b"
};
const allianceConfig = {
  SPA: {
    color: "#e11d48",
    parties: ["DMK", "INC", "CPI", "CPIM","VCK", "MDMK","DMDK","IUML"]
  },
  NDA: {
    color: "#16a34a",
    parties: ["AIADMK", "BJP", "PMK", "AMMK", "TMC", "IJK"]
  },
  NTK: {
    color: "#7f1d1d",
    parties: ["NTK"]
  },
  TVK: {
    color: "#f59e0b",
    parties: ["TVK"]
  }
};
function getAllianceConfig(name) {
  return allianceConfig[name] || {
    color: "#9ca3af",
    parties: ["Others"]
  };
}
const partyConfig = {
  DMK: {
    symbol: "image/DMK.jpg"
  },
   AIADMK: {
    symbol: "image/AIADMK.jpg"
  },
  BJP: {
    symbol: "image/BJP.jpg"
  },
  INC: {
    symbol: "image/INC.jpg"
  },
  CPI: {
    symbol: "image/CPI.png"
  },
  CPIM: {
    symbol: "image/CPI(M).png"
  },
  NTK: {
    symbol: "image/NTK.jpg"
  },
  TVK: {
    symbol: "image/TVK.jpg"
  },
   DMDK:
  {
    symbol:"image/DMDK.png"
  },
  VCK:
  {
    symbol:"image/VCK.jpg"
  },
  MDMK:
  {
    symbol:"image/MDMK.jpg"
  },
  IUML:
  {
    symbol:"image/IUML.png"
  },
  PMK:
  {
    symbol:"image/PMK.jpg"
  }, AMMK:
  {
    symbol:"image/AMMK.png"
  } ,TMC:{
    symbol:"image/TMC.jpg"
  }, IJK:
  {
    symbol:"image/IJK.jpg"
  },
  BSP:
  {
    symbol:"image/BSP.png"
  }
};

function openAlliance(name) {

  const config = getAllianceConfig(name);

  const html = `
    <h3 style="color:${config.color}">${name}</h3>
    <hr>

    ${config.parties.map(p => {
      const symbol = partyConfig[p]?.symbol || "";

      return `
        <div class="party-row">
          <img src="${symbol}" class="party-symbol">
          <span>${p}</span>
        </div>
      `;
    }).join("")}
  `;

  document.getElementById("allianceContent").innerHTML = html;
  document.getElementById("alliancePopup").style.display = "flex";
}
document.getElementById("alliancePopup")
  .addEventListener("click", function(e) {
    if (e.target.id === "alliancePopup") {
      this.style.display = "none";
    }
  });
// ==========================
// API
// ==========================

const MAP_API = window.location.origin + "/api/results";

async function loadMapData() {
  try {
    const res = await fetch(MAP_API);
    const data = await res.json();

    console.log("📦 API DATA COUNT:", data.constituencies.length);

    constituencyData = data.constituencies;

    updateMapColors();

  } catch (err) {
    console.log("❌ MAP ERROR:", err);
  }
}

loadMapData();
//setInterval(loadMapData, 5000);

// ==========================
// NORMALIZE 🔥
// ==========================
function normalize(text) {
  return text
    ?.toLowerCase()
    .replace(/\(sc\)|\(st\)/g, "")  // 🔥 REMOVE SC/ST
    .replace(/[\s\-_()]/g, "")
    .replace(/[^a-z]/g, "");
}
const specialNameFix = {
  "gandharvakottaisc": "gandarvakkottai", 
  "pappireddippatti": "pappireddipatti",
  "sholingur": "sholinghur",
  "kilvaithinankuppamsc":"kilvaithinankuppam"
  
  
};
const trichySplitMap = {
  140: "tiruchirappalli_(west)",
  141: "tiruchirappalli_(east)"
};
const specialACMap = {
  178: "gandarvakkottai",
  231:"colachal"
};
// 🔥 STRICT MATCH (FOR COLOR ONLY)
/*function findConstituencyStrict(mapName) {

  let normMap = normalize(mapName);

  // 🔥 fix only special cases
  if (specialNameFix[normMap]) {
    normMap = normalize(specialNameFix[normMap]);
  }
  

  return constituencyData.find(
    c => normalize(c.name) === normMap
  );
}*/
function findConstituencyStrict(mapName) {

  let normMap = normalize(mapName);

  // 🔥 existing fix (keep)
  if (specialNameFix[normMap]) {
    normMap = normalize(specialNameFix[normMap]);
  }

  // 🔥 ONLY ADD THIS (Trichy special case)
  if (normMap.includes("tiruchirappalli")) {

    const east = constituencyData.find(c =>
      normalize(c.name).includes("tiruchirappallieast")
    );

    const west = constituencyData.find(c =>
      normalize(c.name).includes("tiruchirappalliwest")
    );

    if (!east && !west) return null;
    console.log("EAST:", east?.candidates.length);
console.log("WEST:", west?.candidates.length);
    return {
      name: "Tiruchirappalli (East + West)",
      candidates: [
        ...(east?.candidates || []),
        ...(west?.candidates || [])
      ]
    };
  }
  

  // 🔥 original strict logic (unchanged)
  return constituencyData.find(
    c => normalize(c.name) === normMap
  );
}

// ==========================
// GET MAP NAME 🔥
// ==========================
function getMapName(d) {
  return (
    d.properties.AC_NAME ||
    d.properties.ac_name ||
    d.properties.name ||
    d.properties.constituency ||
    d.properties.id
  );
}

// ==========================
// FIND MATCH 🔥
// ==========================
function findConstituency(mapName) {

  const normMap = normalize(mapName);

  /* if (nameMap[normMap]) {
    normMap = normalize(nameMap[normMap]);
  }*/

  return constituencyData.find(c => {
    const normDB = normalize(c.name);

    return (
      normDB === normMap ||          // exact match
      normDB.includes(normMap) ||    // partial match
      normMap.includes(normDB)       // reverse match
    );
  });
}
/*function findConstituency(mapName) {

  const normMap = normalize(mapName);

  // 🔥 SPECIAL CASE — Tiruchirapalli merge
  if (normMap.includes("tiruchirappalli")) {
  return getMergedTrichy(); // 🔥 use common
}

  // 🔥 EXISTING LOGIC (UNCHANGED)
  return constituencyData.find(c => {
    const normDB = normalize(c.name);

    return (
      normDB === normMap ||          
      normDB.includes(normMap) ||    
      normMap.includes(normDB)       
    );
  });
}

function getMergedTrichy() {

  const east = constituencyData.find(c =>
    normalize(c.name).includes("tiruchirappallieast")
  );

  const west = constituencyData.find(c =>
    normalize(c.name).includes("tiruchirappalliwest")
  );

  if (!east && !west) return null;

  return {
    name: "Tiruchirappalli (East + West)",
    candidates: [
      ...(east?.candidates || []),
      ...(west?.candidates || [])
    ]
  };
}*/

// ==========================
// FIND LEADER 🔥
// ==========================
function getLeader(cons) {
  return cons.candidates.reduce((max, c) => {
    return (!max || c.votes > max.votes) ? c : max;
  }, null);
}

// ==========================
// UPDATE COLORS 🔥
// ==========================
function updateMapColors() {

  svg.selectAll("path")
    .attr("fill", d => {

      const mapName = getMapName(d);
      //const cons = findConstituency(mapName);
      const acNo = d.properties?.AC_NO;
    if (specialACMap[acNo]) {

  const cons = constituencyData.find(c =>
    normalize(c.name) === normalize(specialACMap[acNo])
  );

  if (!cons) return "#ccc";

  const leader = getLeader(cons);

  if (!leader || leader.votes === 0) return "#ccc";

  return allianceColors[leader.alliance_name] || "#888";
}
      

// 🔥 TRICHY SPLIT COLOR FIX
if (normalize(mapName).includes("tiruchirappalli")) {

  const mapped = trichySplitMap[acNo];

  const cons = constituencyData.find(c =>
    normalize(c.name) === normalize(mapped)
  );

  if (!cons) return "#ccc";

  const leader = getLeader(cons);

  if (!leader || leader.votes === 0) return "#ccc";

  return allianceColors[leader.alliance_name] || "#888";
}

// 🔥 NORMAL FLOW

     const cons = findConstituencyStrict(mapName);
      

      if (!cons) {
        console.log("❌ NO MATCH:", mapName);
        return "#ccc";
      }

      const leader = getLeader(cons);

      if (!leader || leader.votes === 0) {
        return "#ccc";
      }

      return allianceColors[leader.alliance_name] || "#888";
    });
}

// ==========================
// CLICK HANDLER 🔥
// ==========================
function handleClick(d) {

  let mapName = getMapName(d);
  let normMap = normalize(mapName);
    const acNo = d.properties?.AC_NO;
  // 🔥 ONLY special case handle
  if (specialNameFix[normMap]) {
    mapName = specialNameFix[normMap];
    console.log("🔧 FIXED NAME:", mapName);
  }

  if (specialACMap[acNo]) {

  const cons = constituencyData.find(c =>
    normalize(c.name) === normalize(specialACMap[acNo])
  );

  if (cons) {
    showPopup(cons);
    return;
  }
}
   if (normalize(mapName).includes("tiruchirappalli")) {

    const mapped = trichySplitMap[acNo];

    if (mapped) {
      const cons = constituencyData.find(c =>
        normalize(c.name) === normalize(mapped)
      );

      if (cons) {
        showPopup(cons);
        return;
      }
    }
  }

  // 🔥 NORMAL SEARCH (no change)
  /*const cons = constituencyData.find(
    c => normalize(c.name) === normalize(mapName)
  );*/
  const cons = findConstituencyStrict(mapName);
  console.log(d);

  if (!cons) {
    console.log("❌ CLICK FAIL:", mapName);
    return;
  }

  console.log("✅ CLICK:", cons.name);

  showPopup(cons);
}
function getPartySymbol(party) {

  if (party === "IND") {
    return "image/IND.png";
  }

  return partyConfig[party]?.symbol || "image/default.png";
}
// ==========================
// POPUP 🔥
// ==========================
function showPopup(cons) {

 

  // 🔥 SORT (highest first)
  const sorted = [...cons.candidates].sort((a, b) => b.votes - a.votes);
const hasVotes = cons.candidates.some(c => c.votes > 0);

let leader = null;
let runner = null;

if (hasVotes) {
  leader = sorted[0];
  runner = sorted[1];
}
const totalVotes = cons.candidates.reduce((sum, c) => sum + c.votes, 0);

const leaderPercent = hasVotes && totalVotes > 0
  ? ((leader.votes / totalVotes) * 100).toFixed(1)
  : 0;

let leadText = "Waiting for counting";

if (hasVotes && runner && runner.votes > 0) {
  const diff = leader.votes - runner.votes;
  leadText = `Leading by ${diff} vs ${runner.party}`;
}

  const html = `
    <div class="popup-header">
      <h2>${cons.name}</h2>
    </div>

    <!-- 🔥 LEADER SECTION -->
   <div class="leader-card">

  ${hasVotes ? `
    <img src="${getPartySymbol(leader.party)}" class="leader-symbol">

    <div class="leader-info">
      <h3 class="notranslate" translate="no">${leader.name}</h3>

      <p class="party-name">${leader.party}</p>
      <span class="alliance">${leader.alliance_name}</span>

      <div class="votes-box">
        <span class="votes">${leader.votes}</span>
        <span class="percent">(${leaderPercent}%)</span>
      </div>

      <div class="lead-text">${leadText}</div>
    </div>
  ` : `
    <div class="leader-info" style="width:100%; text-align:center;">
      <h3>Waiting for counting</h3>
    </div>
  `}

</div>

</div>

    <hr>

    <!-- 🔥 ALL CANDIDATES -->
    <div class="candidate-list">

      ${sorted.map(c => `
        <div class="candidate-row">
         <div class="symbol-box">
  <img 
  src="${
    partyConfig[c.party]?.symbol 
      ? partyConfig[c.party].symbol 
      : 'image/IND.png'
  }"
  class="party-symbol"
>
</div>

          <div class="candidate-info">
            <span class="name notranslate" translate="no">${c.name}</span>
            <span class="party">${c.party}</span>
          </div>

          <div class="votes">${c.votes}</div>
        </div>
      `).join("")}

    </div>
  `;

  document.getElementById("popupContent").innerHTML = html;
  document.getElementById("popup").classList.add("show");
}
const popup = document.getElementById("popup");

popup.addEventListener("click", function (e) {
  if (e.target === popup) {
    closePopup();
  }
});

function closePopup() {
  popup.classList.remove("show");
}


// ==========================
// SEARCH 🔍
// ==========================
document.getElementById("mapSearch").addEventListener("input", function () {

  const value = normalize(this.value);

  const result = constituencyData.find(c =>
    normalize(c.name).includes(value)
  );

 const searchInput = document.getElementById("mapSearch");
const searchBox = document.getElementById("searchResults");

searchInput.addEventListener("input", function () {

  const value = normalize(this.value);

  if (!value) {
    searchBox.style.display = "none";
    return;
  }

  const results = constituencyData.filter(c =>
    normalize(c.name).includes(value)
  );

  if (results.length === 0) {
    searchBox.style.display = "none";
    return;
  }

  searchBox.innerHTML = results.map(c => `
    <div class="search-item" onclick="selectConstituency('${c.name}')">
      ${c.name}
    </div>
  `).join("");

  searchBox.style.display = "block";
});
});
const tooltip = document.getElementById("mapTooltip");

svg.selectAll("path")
  .on("mousemove", function(event, d) {

    const name =
      d.properties.AC_NAME ||
      d.properties.name ||
      d.properties.constituency;

    tooltip.style.display = "block";
    tooltip.innerText = name;

    tooltip.style.left = (event.pageX + 10) + "px";
    tooltip.style.top = (event.pageY + 10) + "px";
  })

  .on("mouseleave", function() {
    tooltip.style.display = "none";
  })

.on("click", function(event, d) {
  tooltip.style.display = "none";  // hide tooltip
  handleClick(d);                  // 🔥 popup open
});

function selectConstituency(name) {

  const searchBox = document.getElementById("searchResults");
  const searchInput = document.getElementById("mapSearch");

  const cons = constituencyData.find(c => c.name === name);

  if (!cons) return;

  showPopup(cons);

  // 🔥 IMPORTANT FIX
  searchBox.style.display = "none";   // hide dropdown
  searchInput.value = "";           // fill input
}
document.addEventListener("click", function (e) {

  const searchBox = document.querySelector(".map-search-box");
  const results = document.getElementById("searchResults");

  // 🔥 if click outside
  if (!searchBox.contains(e.target)) {
    results.style.display = "none";
  }

});