Aegis – AI Race Simulator (TrackShift Hackathon 2025)
Built with passion, pressure, and a crazy love for Formula-1.

“Winning a race is more than speed — it’s strategy, intuition, and the human element working together.”

Aegis is our hackathon-built Formula-1 race simulator created during the TrackShift Hackathon 2025 — a project that blends live racing visuals, intelligent strategy, and a team radio companion that actually feels alive.

Everything you see here was built from scratch, run locally, and coded under pure hackathon adrenaline.
To us, Aegis isn’t just a prototype — it’s our attempt to capture the emotion of being inside a real F1 race team.

🚀 Why We Built Aegis (The Real Story)
We didn’t want to make “just another simulator.”
We wanted something that feels alive, reactive, unpredictable — something that makes you forget you're watching code.

Aegis was built around four feelings:
✨ Watching a car race in real time
✨ Hearing a race engineer talk back with emotion
✨ Seeing strategy unfold dynamically
✨ Racing against imperfect, human-like AI rivals

Aegis combines simulation + AI + personality into one immersive experience.

🏎️ 1. Real-Time Race Track Simulation (Frontend)

We built a full mini-race environment directly inside the browser using pure HTML, CSS, and JavaScript — no frameworks, no shortcuts.
Features
Live SVG-based car movement
Lap counter & speed simulation
Pitlane detection
Pit-lane cues & toast alerts
Fully responsive race dashboard
Powered by index.html, script.js, style.css
This creates a fast, reactive F1-style feeling right in the browser.

🤖 2. AI Strategy Engine (Node.js + OpenAI)

Our in-house “Chief Strategy Officer” — an AI that behaves like an actual race strategist.
What It Does
Generates tyre & pit recommendations
Handles undercut/overcut situations
Predicts Safety Car opportunities
Reacts to changing race context
Blends car data + user questions + real-time state

Endpoint:
POST /api/ai-strategy
It thinks quickly and argues like a real human strategist under pressure.

🎙️ 3. AI Team Radio Companion (FastAPI WebSocket)

This is your race engineer — emotional, chatty, stressed, supportive, chaotic… human.
Highlights
Real-time WebSocket communication
Personality-driven conversations
“Assistant is typing…” animation
Stateful chat memory
Runs on port 8000
WebSocket Endpoint:
ws://localhost:8000/ws/companion/{session_id}

This companion doesn’t just reply — it reacts to the race, to you, and to its own “mood.”

🧠 4. The “Human-Flaw” AI Engine (Our Unique Twist)

Real racing is messy. Drivers misjudge corners. Engineers overthink calls.
We wanted to recreate that chaos — not perfection.
What It Adds
AI rivals with real personalities:
Aggressor (Soft tyres): Fast, risky, unpredictable
Veteran (Hard tyres): Calm, consistent, long-game thinker
Human-like imperfections:
hesitation
delayed reactions
mild miscalculations
emotional spikes
overconfidence under pressure

This is what makes Aegis feel like a real race unfolding, not a clean simulation.

🔮 Future Upgrade: ML-Driven Driver Personalities

Our next goal is to train actual ML models from driver datasets to simulate:
authentic driving styles
overtaking tendencies
tyre management patterns
pressure behavior
pit timing decisions

This will evolve our handcrafted personas into fully data-driven, adaptive AI racers.

🧩 5. Modular Architecture
frontend/
 ├── index.html
 ├── script.js
 └── style.css

backend/
 └── mock_companion.py      # FastAPI WebSocket AI companion

server.js                    # Node.js OpenAI strategy engine
requirements.txt
package.json

Everything is independent, clean, and expandable for future versions.

🛠️ Tech Stack
Frontend
HTML / CSS / Vanilla JS
SVG animation
Toast notifications
WebSockets
Backend
FastAPI (Python)
Node.js + Express
OpenAI API
Hybrid REST + WebSocket architecture

⚙️ How to Run
1️⃣ Clone the Repo
git clone https://github.com/vaidehiw2005/Aegis.git
cd Aegis

2️⃣ Start the FastAPI Companion
pip install -r requirements.txt
cd backend
uvicorn mock_companion:app --host 0.0.0.0 --port 8000 --reload

3️⃣ Start the Node Strategy Engine
npm install

Create .env

OPENAI_API_KEY=your_key_here
(Note: Public API keys aren’t allowed by GPT or GitHub.)
For demo reference, we recorded a working AI companion:
🎥 YouTube Demo: https://youtu.be/LTcl1udYEx8

Run:
node server.js

4️⃣ Run the Frontend

Open:

index.html
OR
npx serve .

🎯 Future Plans

ML-based personality modeling
Multi-car races
Real telemetry integration
Predictive tyre degradation
Cloud-hosted backend
Full race replay mode

👥 Team
Built with passion, caffeine, and chaos during the TrackShift Hackathon.
Vaidehi Wate & Aditi Rajput

❤️ Final Note

Aegis blends AI, simulation, storytelling, and personality into a racing experience that feels human — not just technical.
If you're reading this, thanks for checking out our project.
We hope you enjoy it as much as we enjoyed building it.
Feel free to fork, contribute, or share. 🚀
