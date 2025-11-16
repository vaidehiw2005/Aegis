// --- script.js (full, ready-to-paste) ---
// Aegis: Simulation + AI Companion + Auto-pitting + Pit visuals + Toasts
// Replace your existing script.js with this file and hard-reload the page.

// --- Setup ---
const trackPath = document.getElementById('track-path');
const lapCounterElement = document.getElementById('lap-count-text');
const leaderboardBody = document.querySelector('.leaderboard table tbody');
const rainContainer = document.getElementById('rain-container');
const safetyCarMessageElement = document.getElementById('safety-car-message');

// Agent data structure with wear factors
let agentData = [
  { id: 1, element: document.getElementById('agent-1'), name: "You (Red)", distance: 0, speedFactor: 0.00063, lap: 0, status: 'Racing', hrVariation: 0, wearFactor: 0.0000010 },
  { id: 2, element: document.getElementById('agent-2'), name: "White", distance: 0, speedFactor: 0.00060, lap: 0, status: 'Racing', hrVariation: 0, wearFactor: 0.0000015 },
  { id: 3, element: document.getElementById('agent-3'), name: "Cyan", distance: 0, speedFactor: 0.00064, lap: 0, status: 'Racing', hrVariation: 0, wearFactor: 0.0000020 },
  { id: 4, element: document.getElementById('agent-4'), name: "Yellow", distance: 0, speedFactor: 0.00045, lap: 0, status: 'Racing', hrVariation: 0, wearFactor: 0.0000012 }
];

let pathLength = 0;
if (trackPath) {
  try { pathLength = trackPath.getTotalLength(); } catch (e) { console.error("Error getting path length:", e); }
}

const TOTAL_LAPS = 50;
let raceFinished = false;
let animationFrameId = null;

// End-of-path coords for lap reset (keeps your existing detection)
const END_X = 1069.338623046875;
const END_Y = -98.19002532958984;
const RESET_THRESHOLD_SQUARED = 25;

// Effects
let isRaining = false;
let chaosFactor = 1.0;
let rainInterval = null;

// --- Auto-pitting / tyre-laps logic ---
const PIT_THRESHOLD = 3;        // when tyreLaps <= this, auto-pit
const NEW_TIRE_LIFE = 25;       // laps after a pit
const PIT_DURATION_MS = 2500;   // pit stop time (ms)

// Ensure each agent has tyre life and pitting flags
agentData.forEach(a => {
  if (typeof a.tireLaps === 'undefined' || a.tireLaps === null) a.tireLaps = 15;
  a.pitting = false;
  a.pitCount = a.pitCount || 0;
});

// --- UI helper: update any agent-settings inputs if present
function updateAgentSettingsInputs() {
  try {
    const list = document.getElementById('agent-settings-list');
    if (!list) return;
    agentData.forEach(a => {
      const inp = document.getElementById(`tire-${a.id}`);
      if (inp) inp.value = (typeof a.tireLaps === 'number') ? a.tireLaps : '';
    });
  } catch (e) { /* ignore */ }
}

// --- Toast Popup System ---
function showPopup(msg) {
  const div = document.createElement('div');
  div.className = 'pit-popup';
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => {
    div.classList.add('fade');
    setTimeout(() => div.remove(), 500);
  }, 2000);
}

// --- Pit helpers & visuals ---
const pitPositions = {
  1: { x: 1040, y: -220 },
  2: { x: 1070, y: -220 },
  3: { x: 1100, y: -220 },
  4: { x: 1130, y: -220 }
};

function createPitLabel(agent) {
  if (!trackPath || !agent || !agent.element) return;
  if (document.getElementById(`pit-label-${agent.id}`)) return;
  const svg = trackPath.ownerSVGElement || document.querySelector('#track-svg');
  if (!svg) return;
  const text = document.createElementNS('http://www.w3.org/2000/svg','text');
  text.setAttribute('id', `pit-label-${agent.id}`);
  const pos = pitPositions[agent.id] || pitPositions[1];
  text.setAttribute('x', pos.x);
  text.setAttribute('y', pos.y - 18);
  text.setAttribute('text-anchor','middle');
  text.setAttribute('font-size','12');
  text.setAttribute('fill','#FFFF00');
  text.setAttribute('font-family','Segoe UI, Tahoma, sans-serif');
  text.textContent = 'PIT';
  svg.appendChild(text);
}

function removePitLabel(agent) {
  const el = document.getElementById(`pit-label-${agent.id}`);
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

function sendAgentToPitBox(agent) {
  if (!agent || !agent.element) return;
  agent._prePitPos = { cx: agent.element.getAttribute('cx'), cy: agent.element.getAttribute('cy') };
  const pos = pitPositions[agent.id] || pitPositions[1];
  agent.element.setAttribute('cx', pos.x);
  agent.element.setAttribute('cy', pos.y);
}

function restoreAgentFromPitBox(agent) {
  removePitLabel(agent);
  // we don't forcibly teleport back so moveAgents can draw based on agent.distance
}

function updatePitLabels() {
  const now = Date.now();
  agentData.forEach(agent => {
    if (agent.pitting && agent.pitEnd) {
      const remainingMs = Math.max(0, agent.pitEnd - now);
      const el = document.getElementById(`pit-label-${agent.id}`);
      if (el) el.textContent = `PIT: ${(remainingMs/1000).toFixed(1)}s`;
      else createPitLabel(agent);
    } else {
      removePitLabel(agent);
    }
  });
}

// --- Safe triggerPit (non-blocking; won't pause race) ---
function triggerPit(agent) {
  if (!agent || agent.pitting || agent.status === 'DNF') return;

  agent.pitting = true;
  agent.statusBeforePit = agent.status;
  agent.status = 'Pitting';
  agent.pitCount = (agent.pitCount || 0) + 1;
  agent.pitEnd = Date.now() + PIT_DURATION_MS;

  agent._prevSpeedFactor = agent.speedFactor;
  agent.speedFactor = 0; // only this agent stops

  if (agent.element) {
    sendAgentToPitBox(agent);
    agent.element.style.opacity = '0.4';
  }
  createPitLabel(agent);
  updateLeaderboardHTML();
  updateAgentSettingsInputs();

  showPopup && showPopup(`Agent ${agent.id} (${agent.name}) ENTERING pits`);

  // finish pit after timeout (non-blocking)
  setTimeout(() => {
    agent.speedFactor = agent._prevSpeedFactor || agent.speedFactor || 0.00055;
    agent.tireLaps = NEW_TIRE_LIFE;
    agent.status = 'Racing';
    agent.pitting = false;
    agent.pitEnd = null;

    if (agent.element) {
      agent.element.style.opacity = '1';
      restoreAgentFromPitBox(agent);
    }

    updateLeaderboardHTML();
    updateAgentSettingsInputs();
    showPopup && showPopup(`Agent ${agent.id} (${agent.name}) EXITED pits — fresh tyres`);
    console.log(`Agent ${agent.id} finished pit. tyreLaps=${agent.tireLaps}`);
  }, PIT_DURATION_MS);
}

// Expose to console/global
window.triggerPit = triggerPit;

// --- Animation Loop ---
function moveAgents() {
  if (raceFinished || pathLength <= 0) return;

  agentData.forEach((agent) => {
    if (!agent.element || agent.status === 'DNF') return;

    // Calculate dynamic speed for this agent (pitting agents have speedFactor = 0)
    let currentSpeedFactor = agent.speedFactor;
    currentSpeedFactor -= agent.lap * agent.wearFactor;
    currentSpeedFactor = Math.max(agent.speedFactor * 0.5, currentSpeedFactor);

    let currentSpeed = currentSpeedFactor * pathLength * chaosFactor;
    if (isNaN(currentSpeed)) currentSpeed = 0;

    let previousDistance = agent.distance;
    let potentialDistance = agent.distance + currentSpeed;

    // Current point for coords
    let currentPoint = null;
    try {
      let distForCurrentPoint = Math.max(0, Math.min(agent.distance, pathLength - 0.1));
      currentPoint = trackPath.getPointAtLength(distForCurrentPoint);
    } catch (e) {
      console.error(`Error getting current point for Agent ${agent.id}`, e);
      return;
    }

    let distanceToEndSquared = Infinity;
    if (currentPoint) distanceToEndSquared = Math.pow(currentPoint.x - END_X, 2) + Math.pow(currentPoint.y - END_Y, 2);

    let completedLapThisFrame = false;

    // Lap crossing detection (unchanged)
    if (distanceToEndSquared < RESET_THRESHOLD_SQUARED && currentSpeed > 0 && agent.distance > pathLength / 2) {
      agent.distance = 0;
      agent.lap++;
      completedLapThisFrame = true;
    } else {
      agent.distance = potentialDistance % pathLength;
      if (agent.distance < 0) agent.distance += pathLength;
    }

    // Decrement tyre life and auto-pit when lap completed
    if (completedLapThisFrame) {
      if (typeof agent.tireLaps === 'number') agent.tireLaps = Math.max(0, agent.tireLaps - 1);
      else agent.tireLaps = 0;

      updateAgentSettingsInputs();

      // Auto-pit decision (avoid pitting on race finish lap)
      if (agent.status === 'Racing' && !agent.pitting && agent.tireLaps <= PIT_THRESHOLD && agent.lap < TOTAL_LAPS) {
        triggerPit(agent);
      }
    }

    // Determine draw distance (draw slightly before end if crossing)
    let distanceToDraw = Math.max(0, Math.min(potentialDistance, pathLength - 0.1));
    if (potentialDistance >= pathLength) distanceToDraw = pathLength - 0.1;

    let pointToDraw = null;
    try {
      pointToDraw = trackPath.getPointAtLength(distanceToDraw);
    } catch (e) {
      console.error(`Error getting point to draw for Agent ${agent.id}`, e);
      return;
    }

    // Position the agent (unless in pit box where we've placed it visually)
    if (pointToDraw && typeof pointToDraw.x === 'number' && typeof pointToDraw.y === 'number') {
      // If agent is pitting, we leave the circle at the pit box position. Otherwise update.
      if (!agent.pitting) {
        agent.element.setAttribute('cx', pointToDraw.x);
        agent.element.setAttribute('cy', pointToDraw.y);
      }
    } else {
      console.error(`Agent ${agent.id}: Invalid point object received.`);
    }
  });

  // Sort agents for leaderboard
  agentData.sort((a, b) => {
    if (a.status === 'DNF' && b.status !== 'DNF') return 1;
    if (b.status === 'DNF' && a.status !== 'DNF') return -1;
    if (a.status === 'DNF' && b.status === 'DNF') return 0;
    if (b.lap !== a.lap) return b.lap - a.lap;
    return b.distance - a.distance;
  });

  // Lap counter logic
  if (!raceFinished && agentData.length > 0) {
    const leader = agentData[0];
    if (leader.status === 'Racing' && leader.lap >= TOTAL_LAPS) {
      if (lapCounterElement) lapCounterElement.textContent = TOTAL_LAPS + "/" + TOTAL_LAPS;
      raceFinished = true;
      console.log(`Race Finished! Leader (Agent ${leader.id}) reached ${TOTAL_LAPS} laps.`);
    } else {
      const displayLap = (leader.status === 'Racing') ? leader.lap : (agentData.find(a => a.status === 'Racing')?.lap || 0);
      if (lapCounterElement) lapCounterElement.textContent = Math.min(displayLap, TOTAL_LAPS) + "/" + TOTAL_LAPS;
    }
  }

  // update pit countdown labels (if any agents are pitting)
  if (typeof updatePitLabels === 'function') updatePitLabels();

  // update leaderboard
  updateLeaderboardHTML();

  if (!raceFinished) {
    animationFrameId = requestAnimationFrame(moveAgents);
  } else {
    if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
    displayRaceFinished();
  }
}

// Leaderboard update (includes tyre laps under driver name and pitting time)
function updateLeaderboardHTML() {
  if (!leaderboardBody) return;
  leaderboardBody.innerHTML = '';
  agentData.forEach((agent, index) => {
    const rank = index + 1;
    const row = document.createElement('tr');
    let displayStatus = "";
    let heartRateDisplay = "-";

    if (agent.status === 'DNF') {
      displayStatus = "DNF";
      row.style.opacity = '0.6';
    } else if (agent.pitting) {
      const remaining = agent.pitEnd ? Math.max(0, (agent.pitEnd - Date.now()) / 1000) : 0;
      displayStatus = `Pitting (${remaining.toFixed(1)}s)`;
    } else {
      let baseHeartRate = 140;
      if (rank === 1) baseHeartRate = isRaining ? 135 : 130;
      else if (rank <= 3) baseHeartRate = isRaining ? 150 : 145;
      else baseHeartRate = isRaining ? 155 : 150;
      if (Math.random() < 0.1) { agent.hrVariation = Math.floor(Math.random() * 8) - 4; }
      let variation = agent.hrVariation || 0;
      let currentHeartRate = baseHeartRate + variation;
      heartRateDisplay = `${currentHeartRate} bpm`;
      displayStatus = (agent.id === 1 || agent.id === 4) ? "2-Stop" : (agent.id === 2 ? "1-Stop Risk" : "1-Stop Safe");
    }

    const tyreInfo = (typeof agent.tireLaps === 'number') ? `<br/><small style="color:#aaa">Tyres: ${agent.tireLaps}</small>` : '';
    row.innerHTML = `
      <td>${rank}</td>
      <td>Agent ${agent.id} (${agent.name}) ${tyreInfo}</td>
      <td>${displayStatus}</td>
      <td>${agent.status === 'DNF' ? '-' : (rank === 1 ? "80%" : (rank === 2 ? "15%" : (rank === 3 ? "4%" : "1%")))}</td>
      <td>${heartRateDisplay}</td>
    `;
    leaderboardBody.appendChild(row);
  });
}

// Race finished display
function displayRaceFinished() {
  const leaderboardDiv = document.querySelector('.leaderboard');
  if (!leaderboardDiv) return;
  let finishMessage = document.getElementById('finish-message');
  if (!finishMessage) {
    finishMessage = document.createElement('p');
    finishMessage.id = 'finish-message';
    finishMessage.style.color = '#FFFF00';
    finishMessage.style.textAlign = 'center';
    finishMessage.style.marginTop = '20px';
    finishMessage.style.fontWeight = 'bold';
    leaderboardDiv.appendChild(finishMessage);
  }
  const winner = agentData[0];
  if (winner && winner.status === 'Racing') finishMessage.textContent = `RACE FINISHED! Winner: Agent ${winner.id} (${winner.name})`;
  else {
    const firstFinisher = agentData.find(agent => agent.status === 'Racing');
    if (firstFinisher) finishMessage.textContent = `RACE FINISHED! Winner: Agent ${firstFinisher.id} (${firstFinisher.name})`;
    else finishMessage.textContent = `RACE FINISHED! (All DNF)`;
  }
}

// Create raindrop
function createRaindrop() {
  if (!rainContainer) return;
  const drop = document.createElement('div');
  drop.classList.add('raindrop');
  drop.style.left = Math.random() * 100 + 'vw';
  drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
  drop.style.animationDelay = Math.random() * 1 + 's';
  rainContainer.appendChild(drop);
  setTimeout(() => { if (drop && drop.parentNode === rainContainer) drop.remove(); }, 2000);
}

// Stop rain
function stopRainEffect() {
  if (rainInterval) { clearInterval(rainInterval); rainInterval = null; }
  if (rainContainer) { /* optional: rainContainer.innerHTML = ''; */ }
  document.body.classList.remove('raining');
  if (rainButton) rainButton.classList.remove('active');
  isRaining = false;
  chaosFactor = 1.0;
  if (safetyCarMessageElement) safetyCarMessageElement.style.display = 'none';
}

// Initialization checks and start
if (!trackPath || !leaderboardBody || !rainContainer || !safetyCarMessageElement || agentData.some(agent => !agent.element)) {
  console.error("Initialization Error: Couldn't find one or more required elements.");
} else if (pathLength <= 0) {
  console.error("Error: Track path has zero or invalid length.");
} else {
  if (lapCounterElement) lapCounterElement.textContent = agentData[0].lap + "/" + TOTAL_LAPS;
  updateLeaderboardHTML();
  animationFrameId = requestAnimationFrame(moveAgents);
  console.log("Aegis SVG demo started. Track length:", pathLength);
}

// Buttons wiring
const rainButton = document.getElementById('rain-trigger') || document.querySelector('.controls button:nth-of-type(1)');
const crashButton = document.getElementById('crash-trigger') || document.querySelector('.controls button:nth-of-type(2)');

if (rainButton && crashButton) {
  rainButton.addEventListener('click', () => {
    if (isRaining || raceFinished) return;
    console.log("Heavy Rain Triggered");
    rainButton.classList.add('active');
    document.body.classList.add('raining');
    isRaining = true;
    chaosFactor = 0.3;
    if (safetyCarMessageElement) safetyCarMessageElement.style.display = 'block';
    if (!rainInterval) rainInterval = setInterval(createRaindrop, 50);
  });

  crashButton.addEventListener('click', () => {
    if (raceFinished) return;
    console.log("Crash Triggered - targeting between White(2) and Yellow(4)");
    stopRainEffect();

    let currentRanking = [...agentData].sort((a, b) => {
      if (a.status === 'DNF' && b.status !== 'DNF') return 1;
      if (b.status === 'DNF' && a.status === 'DNF') return 0;
      if (b.lap !== a.lap) return b.lap - a.lap;
      return b.distance - a.distance;
    });

    let whiteRank = currentRanking.findIndex(agent => agent.id === 2);
    let yellowRank = currentRanking.findIndex(agent => agent.id === 4);
    if (whiteRank === -1) whiteRank = Infinity;
    if (yellowRank === -1) yellowRank = Infinity;

    const lowerIndex = Math.min(whiteRank, yellowRank);
    const upperIndex = Math.max(whiteRank, yellowRank);
    let crashedAgentsList = [];

    currentRanking.forEach((rankedAgent, index) => {
      let originalAgent = agentData.find(a => a.id === rankedAgent.id);
      if (originalAgent && originalAgent.status === 'Racing') {
        if (index > lowerIndex && index < upperIndex) {
          console.log(`Agent ${originalAgent.id} (${originalAgent.name}) caught in crash! Rank ${index + 1}`);
          originalAgent.speedFactor = 0;
          originalAgent.status = 'DNF';
          crashedAgentsList.push(originalAgent.id);
          if (originalAgent.element) originalAgent.element.style.opacity = '0.5';
        }
      }
    });

    if (crashedAgentsList.length === 0 && whiteRank !== Infinity && yellowRank !== Infinity) {
      console.log("No agents were between White and Yellow to crash. Fallback crashing White & Yellow");
      agentData.forEach(agent => {
        if ((agent.id === 2 || agent.id === 4) && agent.status === 'Racing') {
          console.log(`Fallback: Crashing Agent ${agent.id} (${agent.name})`);
          agent.speedFactor = 0;
          agent.status = 'DNF';
          crashedAgentsList.push(agent.id);
          if (agent.element) agent.element.style.opacity = '0.5';
        }
      });
    }

    updateLeaderboardHTML();
  });
} else {
  console.warn("Control buttons not found.");
}

// === Extra features: per-agent tyre inputs UI (kept for visibility but auto-updated) ===
const agentSettingsList = document.getElementById('agent-settings-list');
function renderAgentSettings() {
  if (!agentSettingsList) return;
  agentSettingsList.innerHTML = '';
  agentData.forEach(agent => {
    const row = document.createElement('div');
    row.className = 'agent-setting';
    row.innerHTML = `
      <label for="tire-${agent.id}">Agent ${agent.id} Tyre laps left:</label>
      <input id="tire-${agent.id}" type="number" min="0" step="1" value="${agent.tireLaps}" />
      <span style="color:#888;font-size:0.9em;margin-left:8px;">Status: ${agent.status}</span>
    `;
    agentSettingsList.appendChild(row);

    // wire input change (you can still override manually if present)
    const input = row.querySelector(`#tire-${agent.id}`);
    input.addEventListener('change', (e) => {
      const v = parseInt(e.target.value || '0', 10);
      agent.tireLaps = Math.max(0, isNaN(v) ? 0 : v);
      e.target.style.outline = '2px solid rgba(255,0,0,0.2)';
      setTimeout(()=> e.target.style.outline = '', 300);
    });
  });
}
renderAgentSettings();

// --- Stop Rain Button hookup if present ---
const stopRainBtn = document.getElementById('stop-rain-btn');
if (stopRainBtn) {
  stopRainBtn.addEventListener('click', () => {
    stopRainEffect();
    if (rainButton) rainButton.classList.remove('active');
    console.log('Stop Rain clicked - rain stopped.');
  });
}

// --- Pause / Resume Race ---
let isPaused = false;
let savedAnimationFrameId = null;
let savedRainInterval = null;
const pauseBtn = document.getElementById('pause-race-btn');

function pauseRace() {
  if (isPaused) return;
  isPaused = true;
  if (animationFrameId) { cancelAnimationFrame(animationFrameId); savedAnimationFrameId = animationFrameId; animationFrameId = null; }
  if (rainInterval) { clearInterval(rainInterval); savedRainInterval = rainInterval; rainInterval = null; }
  document.body.classList.add('paused');
  if (pauseBtn) pauseBtn.textContent = 'RESUME RACE';
  console.log('Race paused');
}

function resumeRace() {
  if (!isPaused) return;
  isPaused = false;
  if (!rainInterval && savedRainInterval && isRaining) { rainInterval = setInterval(createRaindrop, 50); savedRainInterval = null; }
  if (!animationFrameId) animationFrameId = requestAnimationFrame(moveAgents);
  document.body.classList.remove('paused');
  if (pauseBtn) pauseBtn.textContent = 'PAUSE RACE';
  console.log('Race resumed');
}

if (pauseBtn) {
  pauseBtn.addEventListener('click', () => { if (!isPaused) pauseRace(); else resumeRace(); });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'p' || e.key === 'P') {
    if (!isPaused) pauseRace(); else resumeRace();
  }
});

// === AI Companion Frontend (includes tireLaps in payload and structured display) ===
(function(){
  const widget = document.getElementById('ai-companion-widget');
  const toggle = document.getElementById('ai-companion-toggle');
  const panel = document.getElementById('ai-companion-panel');
  const closeBtn = document.getElementById('ai-companion-close');
  const form = document.getElementById('ai-companion-form');
  const input = document.getElementById('ai-companion-input');
  const messages = document.getElementById('ai-companion-messages');

  if (!widget || !toggle || !panel || !form || !input || !messages) {
    console.warn("AI Companion UI elements missing — companion disabled but simulation continues.");
    return;
  }

  function openPanel(){ widget.classList.remove('ai-companion-closed'); widget.classList.add('ai-companion-open'); panel.setAttribute('aria-hidden','false'); input.focus(); }
  function closePanel(){ widget.classList.remove('ai-companion-open'); widget.classList.add('ai-companion-closed'); panel.setAttribute('aria-hidden','true'); }

  toggle.addEventListener('click', openPanel);
  if (closeBtn) closeBtn.addEventListener('click', closePanel);

  function appendMessage(role, text, id = null) {
    const el = document.createElement('div');
    el.className = `com-msg ${role === 'user' ? 'user' : 'bot'}`;
    el.innerHTML = String(text).replace(/\n/g,'<br>');
    if (id) el.dataset.msgId = id;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  appendMessage('bot', 'Aegis Companion online. I can recommend pit windows, tyre choices, push/save stints, and safety-car responses. Try: "Pit advice for Agent 1"');

  async function postStrategy(payload, timeoutMs = 10000) {
    const controller = new AbortController();
    const timeout = setTimeout(()=> controller.abort(), timeoutMs);
    const tryUrls = ['http://localhost:8000/api/ai-strategy', '/api/ai-strategy', 'http://localhost:3000/api/ai-strategy'];
    let lastErr = null;
    for (const url of tryUrls) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify(payload)
        });
        clearTimeout(timeout);
        if (!res.ok) {
          const txt = await res.text();
          lastErr = new Error(`HTTP ${res.status}: ${txt}`);
          console.warn(`AI Companion: request to ${url} failed:`, res.status, txt);
          continue;
        }
        const data = await res.json();
        return data;
      } catch (err) {
        lastErr = err;
        console.warn(`AI Companion: request to ${url} failed:`, err?.message || err);
      }
    }
    throw lastErr || new Error('Unknown network error');
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    appendMessage('user', q);
    input.value = '';
    appendMessage('bot', 'Computing optimal strategy — analyzing current race state...', 'thinking');

    const payload = {
      message: q,
      context: {
        timestamp: new Date().toISOString(),
        totalLaps: (typeof TOTAL_LAPS !== 'undefined') ? TOTAL_LAPS : 50,
        isRaining: !!(typeof isRaining !== 'undefined' && isRaining),
        agents: (typeof agentData !== 'undefined') ? agentData.map(a => ({
          id: a.id,
          name: a.name,
          lap: a.lap,
          distance: a.distance,
          status: a.status,
          speedFactor: a.speedFactor,
          wearFactor: a.wearFactor,
          tireLaps: (typeof a.tireLaps !== 'undefined') ? a.tireLaps : null
        })) : []
      }
    };

    try {
      const data = await postStrategy(payload, 12000);
      const thinking = messages.querySelector('.com-msg.bot[data-msg-id="thinking"]');
      if (thinking) thinking.remove();
      if (!data) { appendMessage('bot', 'No response from server.'); return; }

      const plain = data.reply || '';
      const advice = data.advice || null;

      if (plain && String(plain).trim().length > 0) appendMessage('bot', plain);

      if (advice && Array.isArray(advice.pitRecommendations)) {
        advice.pitRecommendations.forEach(rec => {
          if (rec && rec.suggestedPitLap !== null) {
            appendMessage('bot',
              `RECOMMENDATION: Agent ${rec.agentId} → Pit on lap ${rec.suggestedPitLap} for ${rec.tyre || 'unspecified'} (Priority: ${rec.priority}). Reason: ${rec.reason}`
            );
          }
        });
      }

      if ((!plain || String(plain).trim().length === 0) && (!advice || !Array.isArray(advice.pitRecommendations) || advice.pitRecommendations.length === 0)) {
        appendMessage('bot', data.error ? `Error: ${data.error}` : 'No advice returned.');
      }
    } catch (err) {
      const thinking2 = messages.querySelector('.com-msg.bot[data-msg-id="thinking"]');
      if (thinking2) thinking2.remove();
      const msg = err?.name === 'AbortError' ? 'Request timed out.' : (err?.message || 'Network error');
      appendMessage('bot', `Network / Server error: ${msg}\n(See console for details.)`);
      console.error('AI Companion error:', err);
    }
  });
})(); // AI companion end

// --- Optional CSS for popup (if you don't have it in style.css, you can inject it here) ---
(function ensurePopupCss(){
  if (document.getElementById('aegis-popup-css')) return;
  const css = `
  .pit-popup {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(255,200,0,0.95);
    padding: 12px 18px;
    border-radius: 8px;
    color: #000;
    font-weight: 700;
    z-index: 99999;
    box-shadow: 0 6px 18px rgba(0,0,0,0.35);
    transition: opacity 0.4s ease, transform 0.35s ease;
  }
  .pit-popup.fade {
    opacity: 0;
    transform: translateY(-12px);
  }`;
  const style = document.createElement('style');
  style.id = 'aegis-popup-css';
  style.textContent = css;
  document.head.appendChild(style);
})();
