// server.js (Node + Express) - AI strategy endpoint (uses OpenAI)
require('dotenv').config();
const express = require('express');
const fetch = global.fetch || require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) console.warn('OPENAI_API_KEY not set in .env');

app.post('/api/ai-strategy', async (req, res) => {
  const { message, context } = req.body || {};
  if (!message) return res.status(400).json({ error: 'No message provided' });

  // Normalize agents array (include tireLaps)
  const agents = (context?.agents || []).map(a => ({
    id: a.id,
    name: a.name,
    lap: Number(a.lap) || 0,
    distance: Number(a.distance) || 0,
    status: a.status || 'Racing',
    speedFactor: Number(a.speedFactor) || 0,
    wearFactor: Number(a.wearFactor) || 0,
    tireLaps: (typeof a.tireLaps !== 'undefined') ? Number(a.tireLaps) : null
  }));

  // Build a readable summary for the prompt (includes tireLaps)
  const agentsSummary = agents.length > 0
    ? agents.map(a => `Agent ${a.id} | ${a.name} | lap:${a.lap} | status:${a.status} | tireLaps:${a.tireLaps}`).join('\n')
    : 'No agents provided';

  // System prompt asks for compact JSON output
  const systemPrompt = [
    "You are 'Aegis', a concise race-strategy assistant for a simulated F1-like race.",
    "Return a short plain-text reply and a compact JSON object EXACTLY (no extra commentary) that follows this schema:",
    "{",
    '  "summary": "<one-sentence summary>",',
    '  "actions": ["short numbered steps or items"],',
    '  "risk": "<single-line risk>",',
    '  "triggers": ["events that change the plan"],',
    '  "pitRecommendations": [',
    '    { "agentId": <number>, "suggestedPitLap": <number|null>, "tyre": "<soft|medium|hard|intermediate|null>", "priority": "<high|medium|low>", "reason":"<short>" }',
    '  ]',
    "}",
    "If no pit is recommended for an agent, put suggestedPitLap=null for that agent in pitRecommendations.",
    "Keep the JSON parsable and do not wrap it in backticks or markdown."
  ].join(' ');

  const userPrompt = [
    `Question: ${message}`,
    `Race state: isRaining=${!!context?.isRaining}, totalLaps=${context?.totalLaps || 'unknown'}, time=${context?.timestamp || ''}`,
    `Agents:\n${agentsSummary}`,
    "Focus advice on the agent(s) named in the question. If no agent named, prioritize the current leader (highest lap, then distance)."
  ].join('\n');

  const payload = {
    model: "gpt-4o-mini", // change to a model you have access to if needed
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.2,
    max_tokens: 400
  };

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const errTxt = await r.text();
      console.error('OpenAI API error', r.status, errTxt);
      return res.status(502).json({ error: 'LLM error', detail: errTxt });
    }

    const data = await r.json();
    const rawReply = data.choices?.[0]?.message?.content || '';

    // Try to extract JSON object from the model reply
    let parsedAdvice = null;
    try {
      // Attempt to find the first {...} block and parse it
      const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedAdvice = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.warn('Failed to parse LLM JSON output, will apply heuristic fallback.', parseErr);
      parsedAdvice = null;
    }

    // Heuristic fallback based on tireLaps if parsing failed or pitRecommendations missing
    function heuristicAdvice() {
      // pick primary agent target (if message mentions "Agent N" prefer that; else leader)
      let targetAgent = null;
      const idMatch = (message.match(/Agent\s*#?\s*(\d+)/i) || message.match(/agent\s*#?\s*(\d+)/i));
      if (idMatch) {
        const id = Number(idMatch[1]);
        targetAgent = agents.find(a => a.id === id) || null;
      }
      if (!targetAgent) {
        // leader => highest lap then highest distance
        targetAgent = agents.slice().sort((a,b)=> {
          if (b.lap !== a.lap) return b.lap - a.lap;
          return b.distance - a.distance;
        })[0] || null;
      }

      // Build pit recommendations: any agent with tireLaps <= 3 => high priority pit next lap
      const pitRecs = agents.map(a => {
        if (a.tireLaps !== null && a.tireLaps <= 3 && a.status === 'Racing') {
          return {
            agentId: a.id,
            suggestedPitLap: Math.max(a.lap + 1, 1), // pit next lap
            tyre: 'hard',
            priority: 'high',
            reason: `Low tyre life (${a.tireLaps} laps left).`
          };
        }
        // otherwise no immediate pit
        return {
          agentId: a.id,
          suggestedPitLap: null,
          tyre: null,
          priority: 'low',
          reason: 'No urgent pit recommended by tyre-laps heuristic.'
        };
      });

      // Short actions: targetAgent specific
      const summary = targetAgent
        ? `Primary guidance targeted at Agent ${targetAgent.id} (${targetAgent.name}).`
        : 'No primary agent identified — general guidance only.';

      const actions = [];
      if (targetAgent && targetAgent.tireLaps !== null && targetAgent.tireLaps <= 3) {
        actions.push(`Pit Agent ${targetAgent.id} next lap for hards.`);
      } else if (targetAgent) {
        actions.push(`Monitor tyre life for Agent ${targetAgent.id}; pit when tyreLaps <= 3 or on planned window.`);
      } else {
        actions.push('No immediate pit actions; maintain pace.');
      }

      return {
        summary,
        actions,
        risk: 'Safety car or sudden heavy rain may change the plan; be ready to pit immediately on SC.',
        triggers: ['Safety car', 'Heavy rain', 'Competitor undercut'],
        pitRecommendations: pitRecs
      };
    }

    const finalAdvice = parsedAdvice && parsedAdvice.pitRecommendations ? parsedAdvice : heuristicAdvice();

    // Return both the plain reply and the structured advice
    return res.json({
      reply: rawReply,
      advice: finalAdvice
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`AI strategy server running on ${PORT}`));
