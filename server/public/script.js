const BASE_URL = window.location.origin;
const API = BASE_URL + "/api/results";
const socket = io(BASE_URL);
// LANGUAGE TOGGLE

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
"துசாந்த் எம்":"துஷாந்த் மு",
"விலவன் குறியீடு":"விளவங்கோடு",
"அலங்குளம்":"ஆலங்குளம்",
"டென்காசி":"தென்காசி",
"கடயநல்லூர்":"கடையநல்லூர்",
"நங்குனேரி":"நாங்குநேரி",
"மணமதுரை (sc)":"மானாமதுரை(sc)",
"சிவகங்கா":"சிவகங்கை",
"ஷோலவந்தன்(SC)":"சோழவந்தான் (SC)",
"கதம்":"நத்தம்",
"அதூர்":"ஆத்தூர்",
"மணப்பறை":"மணப்பாறை",
"அலங்குடி":"ஆலங்குடி",
"பேரவுராணி":"பேராவூரணி",
"மெட்டூர்":"மேட்டூர்",
"வேப்பனஹள்ளி":"வெப்பனகாளி",
"ஹொசூர்":"ஓசூர்",
"பர்கர்":"பர்கூர்",
"பூனமல்லி(SC)":"பூந்தமல்லி",
"அரணி":"ஆரணி",
"போலர்":"போலூர்",
"கீழ் பெரம்பத்தூர்":"கில்பென்னத்தூர்",
"கட்டுமன்னார்கோயில்(SC)":"காட்டுமன்னார்கோயில் (SC)",
"வேதரண்யம்":"வேதாரண்யம்"
/*
"எம்":"M",
"ஆர்":"R",
"ஜே":"J",
"ஏ":"A",
"டி":"T",
"ஜி":"G",
"பி":"P",
"எஸ்":"S",
"யு":"U",
"என்":"N",
"சி":"C",
"கே":"K",
"டபிள்யூ":"W",
"ரூபி":"Ruby",
"தலை சுந்தரம்":"தலவாய் சுந்தரம்",
"மானவை கண்ணன்":"மனவை கண்ணன்",
"எசக்கிமுத்து":"இசக்கிமுத்து",
"வி":"V",
"தனித்தானம்":"தனிதங்கம்",
"சுதரோலி":"சுடரொளி",
"இசாகி":"இசக்கி‌",
"செல்வா":"செல்வ",
"பூசா":"பூச",
"தங்கபாலம்":"தங்கபழம்",
"மரியப்பன்":"மாரியப்பன்",
"தச்சாய்":"தச்சை",
"பிண்டியன்":"பாண்டியன்",
"எசக்கி":"இசக்கி"
*/
};


window.onload = () => {
  let lang = localStorage.getItem("lang");

 if (!lang) {
  lang = "ta";
  localStorage.setItem("lang", "ta");

  document.cookie = "googtrans=/auto/ta; path=/";
  location.reload();
  return;
}

if (lang === "ta") {
  document.cookie = "googtrans=/auto/ta; path=/";
} else {
  document.cookie =
    "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
   updateSwitchUI();
   checkLiveStatus();
};
/*function checkLiveStatus() {
  const today = new Date();

  const day = today.getDate();
  const month = today.getMonth() + 1; // Jan = 0

  const liveEl = document.getElementById("liveIndicator");

  if (month === 5 && day === 4 && today.getHours() >= 8) {
    liveEl.style.display = "inline-flex";
  } else {
    liveEl.style.display = "none";
  }
}*/
function checkLiveStatus() {

  const liveEl = document.getElementById("liveIndicator");
  const timerEl = document.getElementById("liveTimer");

 const target = new Date(2026, 4, 4, 8, 0, 0);

  function update() {
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) {
      liveEl.style.display = "inline-flex";
      timerEl.style.display = "none";
      return;
    }

    // 🔥 CORRECT SPLIT
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    const hours = Math.floor(
      (diff / (1000 * 60 * 60)) % 24
    );

    const mins = Math.floor(
      (diff / (1000 * 60)) % 60
    );

    const secs = Math.floor(
      (diff / 1000) % 60
    );

   timerEl.innerText =
  `${days.toString().padStart(2,"0")}D : ` +
  `${hours.toString().padStart(2,"0")}H : ` +
  `${mins.toString().padStart(2,"0")}M : ` +
  `${secs.toString().padStart(2,"0")}S`;

  }

  update();
  setInterval(update, 1000);
}

let currentLang = localStorage.getItem("lang") || "ta";


document.getElementById("translateBtn").onclick = (e) => {
  e.preventDefault(); // 🔥 block click
  return false;
};
function fixTamilWords() {
  if (localStorage.getItem("lang") !== "ta") return;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;

  while ((node = walker.nextNode())) {
    Object.keys(customFix).forEach(key => {
      if (node.nodeValue.includes(key)) {
        node.nodeValue = node.nodeValue.replaceAll(key, customFix[key]);
      }
    });
  }
}

// 🔥 STRONG LOOP (key fix)
let tamilFixInterval;

function startTamilFix() {
  if (localStorage.getItem("lang") !== "ta") return;

  // clear old interval
  if (tamilFixInterval) clearInterval(tamilFixInterval);

  tamilFixInterval = setInterval(() => {
    fixTamilWords();
  }, 300); // 🔥 repeat continuously
}

// 🔥 stop when English
function stopTamilFix() {
  if (tamilFixInterval) clearInterval(tamilFixInterval);
}

// 🔥 INIT
setTimeout(() => {
  if (localStorage.getItem("lang") === "ta") {
    startTamilFix();
  }
}, 1000);

// 🔥 observer
const fixObserver = new MutationObserver(() => {
  if (localStorage.getItem("lang") === "ta") {
    fixTamilWords();
  }
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


langSwitch.onclick = (e) => {
  e.preventDefault();
  return false;
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
let RESULT_MODE = false;// 🔥 change to true when result declared
let firstLoadDone = false; 
/*async function loadData() {
  try {
    if (!firstLoadDone) {
      document.getElementById("cmLoading").style.display = "block";
    }
    const res = await fetch(API);
    const data = await res.json();
    const list = data.constituencies || data;

    updateCandidateCount(data.constituencies);
    renderCM(list ,partyData);
    if (!firstLoadDone) {
      document.getElementById("cmLoading").style.display = "none";
      firstLoadDone = true;
    }
    updateLeadingParty(data);
   /* const partyData = buildPartyCountFromData(data.constituencies);
renderPartyChart(partyData);
    const allianceData = buildAllianceCount(data.partyLeadCount);
renderAllianceChart(allianceData); 
const partyData = buildPartyCountFromData(data.constituencies);
renderPartyChart(partyData);

// 🔥 IMPORTANT CHANGE HERE
const allianceData = buildAllianceCount(partyData);
renderAllianceChart(allianceData); 
 if (RESULT_MODE) {

      const topAlliance = Object.keys(allianceData)
        .sort((a, b) => allianceData[b] - allianceData[a])[0];

      const leader = getLeaderFromAlliance(topAlliance);

      if (leader && !sessionStorage.getItem("winnerShown")) {
        showWinnerPopup(leader, topAlliance);
        setTimeout(() => {
  startConfetti();
}, 200);  
        sessionStorage.setItem("winnerShown", "true");
      }
    }


  } catch (err) {
    console.log("API ERROR:", err);
  }
}*/
async function loadData() {
  try {

    // 🔥 show loading only first time
    if (!firstLoadDone) {
      document.getElementById("cmLoading").style.display = "block";
    }

    // 🔥 fetch data
    const res = await fetch(API);
    const data = await res.json();
    const list = data.constituencies || data;

    // 🔥 calculate from leading:true ONLY
    const partyData = buildPartyCountFromData(list);

    // 🔥 CM render (IMPORTANT - use partyData)
    renderCM(list, partyData);

    // 🔥 remove loading immediately after render
    if (!firstLoadDone) {
      document.getElementById("cmLoading").style.display = "none";
      firstLoadDone = true;
    }

    // 🔥 update stats
    updateCandidateCount(list);

    // 🔥 party chart
    renderPartyChart(partyData);

    // 🔥 alliance chart (from partyData)
    const allianceData = buildAllianceCount(partyData);
    renderAllianceChart(allianceData);

    // 🔥 top leading party text (FIXED)
    updateLeadingParty({
      allianceLeadCount: allianceData
    });

    // 🔥 winner popup
    if (RESULT_MODE) {

      const topAlliance = Object.keys(allianceData)
        .sort((a, b) => allianceData[b] - allianceData[a])[0];

      const leader = getLeaderFromAlliance(topAlliance);

      if (leader && !sessionStorage.getItem("winnerShown")) {

        showWinnerPopup(leader);

        setTimeout(() => {
          startConfetti();
        }, 200);

        sessionStorage.setItem("winnerShown", "true");
      }
    }

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

function getLeaderFromAlliance(alliance) {

  const map = {
    SPA: {
      name: "M.K.Stalin",
      party: "DMK",
      alliance: "SPA",
      image: "image/mk-stalin.jpg"
    },
    NDA: {
       name: "Edappadi K. Palaniswami",
      party: "AIADMK",
      alliance: "NDA",
      image: "image/Edapadi.jpg"
    },
    NTK: {
      name: "Senthamizhan Seeman",
      party: "NTK",
      alliance: "NTK",
      image: "image/seeman.jpg"
    },
    TVK: {
      name: "Joseph Vijay Chandrasekhar",
      party: "TVK",
      alliance: "TVK",
      image: "image/vijay.jpg"
    }
  };

  return map[alliance];
}
function showWinnerPopup(leader) {

  const popup = document.createElement("div");
  popup.className = "winner-popup";

  popup.innerHTML = `
    <div class="winner-card">

      <h1 class="winner-title">🎉 Congratulations</h1>

      <img src="${leader.image}" class="winner-img">

      <h2 class="winner-name">${leader.name}</h2>

      <p class="winner-party">${leader.party}</p>

      <p class="winner-alliance">${leader.alliance} Alliance Wins</p>

      <button onclick="closeWinnerPopup()">Go to Website</button>

    </div>
  `;

  document.body.appendChild(popup);
  setTimeout(() => {
  if (localStorage.getItem("lang") === "ta") {
    fixTamilWords();
  }
}, 200);

   const partyColors = {
    DMK: "#e11d48",
    AIADMK: "#16a34a",
    NTK: "#7f1d1d",
    TVK: "#f59e0b"
  };

  popup.querySelector(".winner-party").style.color =
    partyColors[leader.party] || "#000";
}

function closeWinnerPopup() {
  document.querySelector(".winner-popup").remove();
}
function startConfetti() {
  const container = document.createElement("div");
  container.className = "confetti-container";

  document.body.appendChild(container);

  for (let i = 0; i < 60; i++) {
    const conf = document.createElement("div");
    conf.className = "confetti";

    conf.style.left = Math.random() * 100 + "vw";
    conf.style.animationDuration = (2 + Math.random() * 3) + "s";
    conf.style.animationDelay = Math.random() * 2 + "s";

      // 🔥 ADD THIS LINE HERE
  conf.style.background = ["orange","red","yellow","white"]
    [Math.floor(Math.random()*4)];

    container.appendChild(conf);
  }

  setTimeout(() => {
    container.remove();
  }, 5000);
}

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
  grid.innerHTML = ""; 
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
  
/*leaders.sort((a, b) => {
  const aCount = partyLeadCount?.[a.party] || 0;
  const bCount = partyLeadCount?.[b.party] || 0;
  return bCount - aCount; // 🔥 highest first
});*/
  
const manualOrder = {
  "DMK": 1,
  "AIADMK": 2,
  "NTK": 3,
  "TVK": 4
};
leaders.sort((a, b) => {
  return (manualOrder[a.party] || 999) - (manualOrder[b.party] || 999);
});
  // 🔥 RENDER
  grid.innerHTML = leaders.map(l => {

    const count = partyLeadCount?.[l.party] || 0;
    const config = partyConfig[l.party] || {};

    return `
      <div class="cm-card">

        <div class="badge notranslate" translate="no">${l.alliance}</div>
        
        <img src="${l.img}" class="cm-img">
        
        <h3>${l.name}</h3>
         <div class="party-row">
      <img src="${config.symbol}" class="party-symbol">
      <p style="color:${config.color}; font-weight:800; font-size:14px;">
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
function buildPartyCountFromData(constituencies) {

  const partyCount = {};

  // 🔥 fast loop
  for (let i = 0; i < constituencies.length; i++) {

    const cons = constituencies[i];

    // 🔥 ONLY leading (no vote fallback)
    const leader = cons.candidates.find(c => c.leading === true);

    // ❌ no leading → skip
    if (!leader) continue;

    const party = leader.party;

    // 🔥 increment count
    if (partyCount[party]) {
      partyCount[party]++;
    } else {
      partyCount[party] = 1;
    }
  }

  return partyCount;
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
      allianceCount[alliance] += partyLeadCount?.[party] || 0;
    });

  }

  return allianceCount;
}


