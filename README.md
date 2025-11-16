Aegis: AI Race Companion - Demo
=============================

What's included
- `index.html` - Frontend demo (SVG track, agents, leaderboard, controls)
- `style.css` - Styling for the page and the AI companion widget
- `script.js` - Simulation logic + AI Companion frontend code
- `server.js` - Node/Express backend with `/api/ai-strategy` endpoint (forwards to OpenAI)
- `package.json` - NPM deps and start script
- `.env.example` - Example environment file

How to run locally (VS Code)
1. Install Node.js (>=16 recommended).
2. Copy `.env.example` to `.env` and set `OPENAI_API_KEY` with your OpenAI API key.
3. Install dependencies:
   ```
   npm install
   ```
4. Start the backend:
   ```
   npm start
   ```
   This runs the Express server on `http://localhost:3000` by default.

5. Open `index.html` in the browser:
   - For best results, serve the folder with a small static server (so fetch calls to `/api/ai-strategy` work easily). Example:
     ```
     npx serve .
     ```
     Or open VS Code Live Server extension and serve the workspace root.

Notes
- The demo calls the OpenAI chat completions endpoint. Make sure your API key has access to the specified model or change `model` in `server.js`.
- Keep your API key secret; do not commit it to version control.
