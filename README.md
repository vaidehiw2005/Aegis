#Aegis
Aegis – Real-Time F1 Race Strategy & AI Companion
Built for the TrackShift Hackathon
“Winning a race is more than speed — it’s strategy, intuition, and data working together.”

Aegis is our hackathon-built F1 simulation experience created specifically for the TrackShift Hackathon — blending real-time race visuals, AI-powered race strategy, and a team radio companion with personality.
Everything runs locally, everything updates live, and everything was crafted from scratch under hackathon pressure.
This project is not just a prototype — it’s our attempt to capture the emotion of being inside a real F1 race team.

🚀 Why We Built This

We wanted to build something that feels alive:

✨ A car racing in real-time
✨ An AI strategist thinking like a real F1 engineer
✨ A team radio companion who reacts emotionally
✨ Rivals with human-like flaws & tyre-driven behavior

Aegis merges simulation + strategy + personality into one immersive racing experience.

🏎️ 1. Real-Time Race Track Simulation (Frontend)
We built a mini racing world directly in the browser using pure HTML, CSS, and JavaScript.
Features
SVG-based dynamic car movement
Lap counter & speed simulation
Pitlane detection
Visual pit-lane cues
Toast notifications for key events
Fully responsive UI
Powered by: index.html, script.js, style.css
This creates a smooth, reactive F1-style dashboard that feels alive.

🤖 2. AI Strategy Engine (Node.js + OpenAI)
Our “Chief Strategy Officer” analyzes the race and gives human-like strategic decisions.
Endpoint
POST /api/ai-strategy
Generates
Strategy recommendations
Tyre compound calls
Fuel & undercut/overcut logic
Safety car scenarios
Real-time, context-based feedback
The strategist blends car data + user questions + race context to produce detailed insights.

🎙️ 3. AI Team Radio Companion (FastAPI WebSocket)
A personality-driven race engineer who talks to you in real time.
Highlights
Stateful live chat sessions
“Assistant is typing…” delay for realism
Emotion-based responses
Personality-driven tone
Live WebSocket communication
Runs on port 8000

WebSocket Endpoint
ws://localhost:8000/ws/companion/{session_id}

This companion doesn’t just answer you — it reacts to the race.

🧠 4. Our Solution: The “Human-Flaw” AI Engine
Real racing isn’t perfect — drivers make mistakes, overpush, or hold back.
We built the Human-Flaw AI Engine to model this human element.
What it does
Creates AI rivals with distinct personalities:
Aggressor (Soft tyres): Fast early, risky, drops off late
Veteran (Hard tyres): Conservative early, strong long-run pace

Introduces human-like imperfections:
hesitation
overconfidence
delayed reactions
emotional spikes
mild miscalculations
This makes the race feel dynamic, unpredictable, and human — not robotic.

🔮 Future ML Upgrade

We plan to train real ML models using driver datasets to capture:
authentic driving styles
overtaking tendencies
tyre management
pressure behavior
pit timing patterns
This will transform our handcrafted personas into data-driven adaptive AI rivals.

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

Each module is independent, making the project easy to extend or replace.

🛠️ Tech Stack
Frontend
HTML / CSS / Vanilla JS
SVG-based race animation
Toast notifications
WebSocket integration

Backend
FastAPI (Python) — AI companion
Node.js + Express — strategy engine
OpenAI API — decision-making logic
Hybrid REST + WebSocket architecture

⚙️ Setup & Run Instructions
1️⃣ Clone the Repository
git clone https://github.com/<your-username>/Aegis.git
cd Aegis

2️⃣ Run FastAPI Companion
pip install -r requirements.txt
cd backend
uvicorn mock_companion:app --host 0.0.0.0 --port 8000 --reload

3️⃣ Run Node.js Strategy Engine
npm install
Create .env:
OPENAI_API_KEY=your_key_here (it will not work as GPT is not giving API key for Public post)
Youtube Link : https://youtu.be/LTcl1udYEx8  (As this is the screenrecoding of the AI compainion bot which we have integrated on local environment, so you can judge by it what exactly and how it works)

Run:
node server.js

4️⃣ Run Frontend

Open:
index.html
Or serve with:
npx serve .

🎯 Future Improvements

ML-based driver personality modeling
Multi-car simulation
Real telemetry ingestion
Predictive tyre wear models
Cloud deployment
Race replay mode

👥 Team
Built during the TrackShift Hackathon with passion, caffeine, and a love for motorsport.
Vaidehi Wate & Aditi Rajput 

❤️ Final Note

Aegis blends AI, simulation, and storytelling — turning racing into a human experience, not just a technical one.
If you’re reading this, thank you for checking out our work!
Feel free to contribute, fork, or share.

