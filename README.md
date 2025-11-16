# Aegis

Aegis is our hackathon-built F1 simulation experience created specifically for the TrackShift Hackathon — blending real-time race visuals, AI-powered race strategy, and a team radio companion with personality.
Everything runs locally, everything updates live, and everything was crafted from scratch under hackathon time pressure.

This project is more than a prototype.
It’s our attempt to recreate the emotion of being inside an F1 race team
Aegis – Real-Time F1 Race Strategy & AI Companion
“Because winning a race is more than speed — it’s strategy, intuition, and data working together.”

Aegis is our hackathon-built F1 simulation experience that blends real-time race visuals, AI-powered race strategy, and a team radio companion with personality — all running locally, all built from scratch, all crafted under hackathon pressure.

This project is not just a prototype.
It's our attempt to recreate the emotion of being inside an F1 race team.

🚀 Why We Built This

During the hackathon, our goal wasn’t just to make another dashboard or another AI demo.
We wanted to build something that:
✨ feels alive
✨ reacts in real-time
✨ talks back like a real race engineer
✨ makes you feel like you're driving a Formula-1 car
And Aegis was born.

🚗💨 Live Demo Flow (The Experience for Judges)
You open the dashboard.
The car starts racing live around a real SVG track.
Lap count increases.
Pitlane events trigger real-time animations + toast alerts.
You ask the Strategy AI: “We’re losing pace. Should we pit?”
It analyzes context + car data and gives a professional strategy call.
You open team radio and talk to your AI race engineer…
It replies instantly, with personality, urgency, and memory.
This entire interaction is local, fast, and immersive.

🏎️ 1. Real-Time F1 Race Simulation (Frontend)
We handcrafted a complete F1-style racing UI using pure Vanilla JS + SVG, no frameworks — designed to run smoothly even under hackathon stress.

Features:
SVG-based dynamic car tracking on a real track path
Lap counter, speed simulation, and timing logic
Pitlane detection via path checkpoints
Visual pit-lane highlights
Toast notifications for events like pit stops & lap completions
A fully responsive F1 dashboard UI
Powered entirely by:
index.html
script.js
style.css
This isn’t just UI — it's a mini racing ecosystem running in your browser.

🧠 2. Our Solution: The “Human-Flaw” AI Engine
Real racing isn’t perfect — and neither are our AI drivers.
We built the Human-Flaw AI Engine to simulate the human element of motorsport: personality, pressure, mistakes, and tyre-based behavior.

👥 AI Rivals with Personalities
Each rival has a distinct racing identity:
Aggressor (Soft Tyres): Fast early, risky moves, falls off when tyres fade.
Veteran (Hard Tyres): Slow start, consistent pace, strong long-run strategy.
This creates races shaped by strategy and tyre wear, not just raw speed.

⚙️ Human-Like Imperfections
Our AI intentionally shows human behaviors:
hesitation
overconfidence
delayed reactions
strategic misreads
emotional spikes under pressure
These controlled flaws make every race feel dynamic and believable.

🔮 Future Upgrade: ML-Driven Driver Personalities
In future versions, we will integrate real driver datasets to train ML models that capture authentic:
driving styles
overtaking tendencies
tyre management patterns
pit decision habits
This will evolve our rivals from handcrafted personas into data-driven, adaptive racing AI.

🤖 3. AI Strategy Engine (Node.js + OpenAI)

This module is designed to behave like an actual F1 strategic brain.
Endpoint:
POST /api/ai-strategy

What it generates:
Real-time race strategy advice
Tyre compound recommendations
Fuel load considerations
Safety-car / VSC scenario analysis
Under/overcut strategy logic
Adaptive decisions based on driver behavior + car status

Why Node.js?
We wanted the strategist to be:
Fast
Non-blocking
Able to integrate with streaming or future telemetry
All secrets are stored in .env, keeping it clean for deployment.

🎙️ 4. AI “Mock Companion” (FastAPI WebSocket)

One of the most personal features of Aegis:
Your team radio engineer — reactive, emotional, and slightly chaotic (just like real F1 radio).
What makes it special:
Personality-based responses
Maintains stateful chat sessions
Includes "assistant is typing…" delays
Runs on port 8000
Live WebSocket communication
Feels like an actual human on the other end

WebSocket Endpoint:

ws://localhost:8000/ws/companion/{session_id}


We built this because we wanted the race to talk back — not with robotic AI text, but with emotion and urgency.

🧩 5. Modular Architecture
We designed Aegis to be hackathon-friendly, modular, and expandable.
Each part can be swapped, edited, or scaled independently.

frontend/
 ├── index.html
 ├── script.js
 └── style.css

backend/
 └── mock_companion.py      # FastAPI WebSocket AI companion

server.js                    # Node.js OpenAI strategy engine
requirements.txt
package.json


This architecture keeps the prototype clean, understandable, and ready for future expansion.
🛠️ Tech Stack

🎨 Frontend
HTML / CSS / Vanilla JS
SVG race track animation
Toast notifications
Real-time WebSocket integration
Custom physics-style motion simulation
Zero React / Zero frameworks — lightweight and fast

🔧 Backend

FastAPI (Python) — AI companion
Node.js + Express — strategy engine
OpenAI API — logical, contextual race decisions
Hybrid WebSocket + REST architectureAegis 

🗂️ Other Tools
uvicorn for fast API serving
node-fetch for API calls
dotenv for secure config

Local dev environment for offline demo capability

⚙️ How to Run the Project
1️⃣ Clone Repository
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

2️⃣ Start FastAPI Companion (Python Backend)
pip install -r requirements.txt
cd backend
uvicorn mock_companion:app --host 0.0.0.0 --port 8000 --reload

3️⃣ Start Node.js Strategy Engine
npm install

Create .env:
OPENAI_API_KEY=your_key_here

Run server:
node server.js
Runs on:

http://localhost:3000

4️⃣ Run Frontend
Simply open:
index.html


Or run a static server:
npx serve .

🎯 Future Plans
We didn’t stop imagining. Here’s what Aegis could become:
Multi-car racing simulation
ML will be the future vision : - which will replace the simple rule of Behaviorial AI with Machine Learning.
AI/ML model will be trained on real - F1 drivers data (their tekemetry, radio sentiment, biometric heart rates) for creating hyper - realistic data driver agents/personas.
Real telemetry integration from F1 archives
Predictive tyre degradation models
Pit stop timing accuracy improvements
Cloud deployment for global demos
Full race replay mode
Driver personality modules

✨ Team & Credits

Built with dedication, caffeine, and way too much excitement during our hackathon.

Vaidehi Wate – Simulation logic, frontend integration, architecture

You can add more teammates here if needed

❤️ Final Note

Aegis represents what we genuinely love building —
experiences that merge AI, simulation, and storytelling.

If you’re reading this, thank you for checking out our project.
We hope you enjoy using it as much as we enjoyed creating it.
