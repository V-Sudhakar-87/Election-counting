const BASE_URL = window.location.origin;
const API = BASE_URL + "/api/results";
const socket = io(BASE_URL);
// LANGUAGE TOGGLE
/*const dropdown = document.getElementById("langDropdown");

// OPEN / CLOSE
document.getElementById("translateBtn").onclick = () => {
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
};

// CLOSE OUTSIDE CLICK
document.addEventListener("click", (e) => {
  if (!e.target.closest(".translate-box")) {
    dropdown.style.display = "none";
  }
});

// LANGUAGE CHANGE
function setLang(lang) {
  dropdown.style.display = "none";

  if (lang === "ta") {
    document.getElementById("titleText").innerText = "தேர்தல் 2026";
    document.getElementById("subText").innerText = "நேரலை எண்ணிக்கை";
    document.getElementById("translateBtn").innerText = "🌐 ";
  } else {
    document.getElementById("titleText").innerText = "Election 2026";
    document.getElementById("subText").innerText = "Live Counting";
    document.getElementById("translateBtn").innerText = "🌐";
  }
}*/
const customFix = {
  "டிவிகே": "தவெக",
  "என்.டி.கே": "நா.த.க",
  "டி.எம்.கே": "திராவிட முன்னேற்ற கழகம்",
  "ஏ.ஐ.அதி.மு.க": "அண்ணா திராவிட முன்னேற்ற கழகம்",
  "ஸ்பா":"மதச்சார்பற்ற முற்போக்குக் கூட்டணி",
  "என்டிஏ":"தேசிய ஜனநாயகக் கூட்டணி",
  "செந்தமிழன் சீமன்":"செந்தமிழன் சீமான்",
  "லீட்கள்":"முன்னணிகள்",
  "லீட்ஸ்":"முன்னணிகள்",
  "டாஷ்போர்டு":"தகவல்பலகை",
  "டிஎன்":"TN",
  "எம்.கே. ஸ்டாலின்":"மு.க.ஸ்டாலின்",
  "தொகுதியால்":"",
  "இன்க்":"காங்கிரஸ்",
"இந்தியா":"சுயேட்ச்சை",
"சுதாகர் வி":"சுதாகர் வெ",
"ஜெஸ்வந்த் சிங் எஸ்":"ஜெஸ்வந்த் சிங் சி",
  "என்டிஏ":"தேசிய ஜனநாயகக் கூட்டணி",
"தங்க அபர்னா எம்":"தங்க அபர்ணா மா",
"ஜெசிகா ஜே":"ஜெசிகா ஜா",
"பிரவீன் கே":"பிரவீன் க",
"துசாந்த் எம்":"துஷாந்த் மு"
};
/*window.onload = () => {
  const lang = localStorage.getItem("lang");

  if (!lang) {
    // 👉 first time open → Tamil
    document.cookie = "googtrans=/auto/ta";
    localStorage.setItem("lang", "ta");
    location.reload();
  }
   updateSwitchUI();
};*/

let currentLang = localStorage.getItem("lang") || "ta";

document.getElementById("translateBtn").onclick = () => {
  const combo = document.querySelector(".goog-te-combo");

  if (!combo) {
    console.log("Translate loading...");
    return;
  }

  if (currentLang === "en") {
    // 👉 English → Tamil
    currentLang = "ta";
    localStorage.setItem("lang", "ta");
    //updateSwitchUI(); 
    combo.value = "ta";
    combo.dispatchEvent(new Event("change"));

  } else {
    // 👉 Tamil → ORIGINAL English
   /* localStorage.setItem("lang", "en");
    updateSwitchUI();
   document.cookie = "googtrans=/auto/en";
    location.reload();
    return;*/
    currentLang = "en";
    localStorage.setItem("lang", "en");

    combo.value = "en";
    combo.dispatchEvent(new Event("change"));
  }
  updateSwitchUI();
  hideGoogleBar();
  setTimeout(hideGoogleBar, 50);
  setTimeout(hideGoogleBar, 200);
  setTimeout(hideGoogleBar, 500);
};
function fixTamilWords() {

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;

  while (node = walker.nextNode()) {

    Object.keys(customFix).forEach(key => {

      if (node.nodeValue.includes(key)) {
        node.nodeValue = node.nodeValue.replaceAll(key, customFix[key]);
      }

    });

  }
}

setTimeout(fixTamilWords, 500);
setTimeout(fixTamilWords, 1000);

const fixObserver = new MutationObserver(() => {
  fixTamilWords();
});

fixObserver.observe(document.body, {
  childList: true,
  subtree: true
});
// 🔥 ONLY REMOVE TOP BAR (NOT ENGINE)
function hideGoogleBar() {
  const banner = document.querySelector('.goog-te-banner-frame');
  if (banner) banner.style.display = "none";

  document.querySelectorAll('.skiptranslate').forEach(el => {
    el.style.display = "none";
  });

  document.body.style.top = "0px";
}
requestAnimationFrame(hideGoogleBar);

// 🔥 run continuously
setInterval(hideGoogleBar, 500);

// 🔥 observe changes
const observer = new MutationObserver(hideGoogleBar);
observer.observe(document.body, {
  childList: true,
  subtree: true
});
const langSwitch = document.getElementById("langSwitch");

function updateSwitchUI() {
  if (currentLang === "ta") {
    langSwitch.classList.add("active");
  } else {
    langSwitch.classList.remove("active");
  }
}


langSwitch.onclick = () => {
  document.getElementById("translateBtn").click();
};


// THEME
let dark = true;

const themeBtn = document.getElementById("themeToggle");

themeBtn.onclick = () => {
  dark = !dark; // toggle true/false

  document.body.classList.toggle("light");

  themeBtn.innerHTML = dark
    ? '<i class="fa-solid fa-sun fa-2x"></i>'
    : '<i class="fa-solid fa-moon fa-2x"></i>';
};

//canditate logic
//const API = "http://localhost/api/results";
const allianceMembers = {
  SPA: ["DMK", "INC", "CPI", "CPIM","VCK", "MDMK","DMDK","IUML"],
  NDA: ["AIADMK", "BJP", "PMK", "AMMK", "TMC", "IJK"],
  NTK: ["NTK"],
  TVK: ["TVK"]
};

async function loadData() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    const list = data.constituencies || data;

    updateCandidateCount(data.constituencies);
    renderCM(list ,data.partyLeadCount);
    updateLeadingParty(data);
    const partyData = buildPartyCountFromData(data.constituencies);
renderPartyChart(partyData);
    const allianceData = buildAllianceCount(data.partyLeadCount);
renderAllianceChart(allianceData);  

 // 🔥 LANGUAGE FIX
    setTimeout(() => {
      const lang = localStorage.getItem("lang");

      if (lang === "en") {
        const combo = document.querySelector(".goog-te-combo");
        if (combo) {
          combo.value = "en";
          combo.dispatchEvent(new Event("change"));
        }
      }
    }, 500);
  } catch (err) {
    console.log("API ERROR:", err);
  }
}
socket.on("votesUpdated", () => {
  console.log("🔥 LIVE UPDATE RECEIVED");

  loadData();      // CM + counts
  loadMapData();   // map update
});
function updateCandidateCount(list) {

  let total = 0;

  list.forEach(c => {
    total += c.candidates.length;
  });

  document.getElementById("candidateCount").innerText = total;
}

loadData();

/*setInterval(loadData, 5000);*/
const allianceCM = {
  SPA: "DMK",
  NDA: "AIADMK",
  NTK: "NTK",
  TVK: "TVK",
  OTHERS: "IND"
};

function renderCM(data, partyLeadCount) {

  const grid = document.getElementById("cmGrid");
  const partyConfig = {
  "DMK": {
    color: "#e11d48",   // red
    symbol: "image/DMK.jpg"
  },
  "AIADMK": {
    color: "#16a34a",   // green
    symbol: "image/AIADMK.jpg"
  },
  "NTK": {
    color: "#7f1d1d",   // dark red
    symbol: "image/NTK.jpg"
  },
  "TVK": {
    color: "#f59e0b",   // orange/gold
    symbol: "image/TVK.jpg"
  }
};

  // 🔥 STATIC LEADERS
  const leaders = [
    {
      name: "M.K Stalin",
      party: "DMK",
      alliance: "SPA",
      img: "image/mk-stalin.jpg"
    },
    {
      name: "Edappadi K. Palaniswami",
      party: "AIADMK",
      alliance: "NDA",
      img: "image/Edapadi.jpg"
    },
    {
      name: "Senthamizhan Seeman",
      party: "NTK",
      alliance: "NTK",
      img: "image/seeman.jpg"
    },
    {
      name: "Joseph Vijay Chandrasekhar",
      party: "TVK",
      alliance: "TVK",
      img: "image/vijay.jpg"
    }
  ];

  // 🔥 CALCULATE PARTY VOTES
  
leaders.sort((a, b) => {
  const aCount = partyLeadCount?.[a.party] || 0;
  const bCount = partyLeadCount?.[b.party] || 0;
  return bCount - aCount; // 🔥 highest first
});
  

  // 🔥 RENDER
  grid.innerHTML = leaders.map(l => {

    const count = partyLeadCount?.[l.party] || 0;
    const config = partyConfig[l.party] || {};

    return `
      <div class="cm-card">

        <div class="badge">${l.alliance}</div>
        
        <img src="${l.img}" class="cm-img">
        
        <h3>${l.name}</h3>
         <div class="party-row">
      <img src="${config.symbol}" class="party-symbol">
      <p style="color:${config.color}; font-weight:800; font-size:17px;">
        ${l.party}
      </p>
    </div>

        <div class="status">
          ${count > 0 ? count + " leads" : "Waiting"}
        </div>

      </div>
    `;
  }).join("");
}

function updateLeadingParty(data) {

  const allianceLeadCount = data.allianceLeadCount || {};

  // 🔥 only main alliances
  const validAlliances = ["SPA", "NDA", "NTK", "TVK"];

  let topAlliance = null;
  let max = 0;

  validAlliances.forEach(a => {
    const count = allianceLeadCount[a] || 0;

    if (count > max) {
      max = count;
      topAlliance = a;
    }
  });

  const el = document.getElementById("leadingParty");

  // 🔥 no votes
  if (!topAlliance || max === 0) {
    el.innerText = "Waiting";
    return;
  }

  // 🔥 alliance → CM party
  const cmParty = allianceCM[topAlliance];

  el.innerText = cmParty;

  // 🔥 color
  const partyColors = {
    DMK: "#e11d48",
    AIADMK: "#16a34a",
    NTK: "#7f1d1d",
    TVK: "#f59e0b"
  };

  el.style.color = partyColors[cmParty] || "#fff";
}

function renderPartyChart(partyLeadCount) {

  const container = document.getElementById("partyChart");

  const partyColors = {
    DMK: "#e11d48",
    AIADMK: "#16a34a",
    NTK: "#7f1d1d",
    TVK: "#f59e0b",

    // 🔥 optional extra colors
    DMDK: "#8b5cf6",
    PMK: "#0ea5e9",
    BSP: "#2563eb"
  };

  let othersCount = 0;

  const processed = Object.entries(partyLeadCount).map(([party, count]) => {

    // 🔥 ONLY IND goes to others
    if (party === "IND") {
      othersCount += count;
      return null;
    }

    return [party, count];
  }).filter(Boolean);

  // 🔥 add others only if exists
  if (othersCount > 0) {
    processed.push(["OTHERS", othersCount]);
  }

  // 🔥 sort high → low
  const sorted = processed.sort((a, b) => b[1] - a[1]);
  const allZero = sorted.length === 0 || sorted.every(([_, count]) => count === 0);

  if (allZero) {
    container.innerHTML = `
      <div style="
        text-align:center;
        padding:30px;
        color:#9ca3af;
        font-weight:600;
      ">
        Waiting for counting...
      </div>
    `;
    return;
  }

  const max = sorted[0]?.[1] || 1;

  container.innerHTML = sorted.map(([party, count]) => {

    const color =
      partyColors[party] || "#9ca3af"; // default gray

    return `
      <div class="bar">
        <div class="bar-label">
          <span>${party}</span>
          <span>${count}</span>
        </div>

        <div class="bar-track">
          <div class="bar-fill"
            style="
              width:${(count / max) * 100}%;
              background:${color};
            ">
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderAllianceChart(allianceLeadCount) {

  const container = document.getElementById("allianceChart");

  const allianceColors = {
    SPA: "#e11d48",
    NDA: "#16a34a",
    NTK: "#7f1d1d",
    TVK: "#f59e0b"
  };

  const sorted = Object.entries(allianceLeadCount)
    .filter(([a]) => allianceColors[a])
    .sort((a, b) => b[1] - a[1]);

  const max = sorted[0]?.[1] || 1;

  container.innerHTML = sorted.map(([alliance, count]) => `
    <div class="bar">
      <div class="bar-label">
        <span>${alliance}</span>
        <span>${count}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill"
          style="
            width:${(count/max)*100}%;
            background:${allianceColors[alliance]};
          ">
        </div>
      </div>
    </div>
  `).join("");
}
function buildAllianceCount(partyLeadCount) {

  const allianceCount = {
    SPA: 0,
    NDA: 0,
    NTK: 0,
    TVK: 0
  };

  for (let alliance in allianceMembers) {

    allianceMembers[alliance].forEach(party => {
      allianceCount[alliance] += partyLeadCount[party] || 0;
    });

  }

  return allianceCount;
}
function buildPartyCountFromData(constituencies) {

  const partyCount = {};

  constituencies.forEach(cons => {

    const sorted = [...cons.candidates].sort((a, b) => b.votes - a.votes);

    const leader = sorted[0];

    // 🔥 IMPORTANT FIX
    if (!leader || leader.votes === 0) return;

    const party = leader.party;

    if (!partyCount[party]) {
      partyCount[party] = 0;
    }

    partyCount[party]++;
  });

  return partyCount;
}


