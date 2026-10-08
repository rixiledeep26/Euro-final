const express = require("express");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT) || 8787;
const HOST = "0.0.0.0";

app.disable("x-powered-by");
app.use(express.static(__dirname));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "euro20-500-odds-overseer", time: new Date().toISOString() });
});

function normalizeOdds(payload) {
  const events = Array.isArray(payload)
    ? payload
    : (payload?.events || payload?.data || payload?.odds || []);
  const out = [];

  for (const e of events) {
    const home = e.home_team || e.home || e.teams?.[0];
    const away = e.away_team || e.away || e.teams?.[1];
    if (!home || !away) continue;

    let h, d, a;
    const bookmakers = e.bookmakers || e.bookmaker || [];
    for (const b of bookmakers) {
      const bookmakerName = String(b.key || b.name || "").toLowerCase();
      if (!bookmakerName.includes("betway")) continue;
      const markets = b.markets || b.market || [];
      for (const m of markets) {
        const marketName = String(m.key || m.name || "").toLowerCase();
        if (!["h2h", "moneyline", "1x2"].includes(marketName)) continue;
        const outcomes = m.outcomes || m.odds || [];
        for (const z of outcomes) {
          const name = String(z.name || z.label || "").toLowerCase();
          const price = Number(z.price ?? z.odds);
          if (!Number.isFinite(price)) continue;
          if (name === "home" || name === String(home).toLowerCase()) h = price;
          else if (name === "draw") d = price;
          else if (name === "away" || name === String(away).toLowerCase()) a = price;
        }
      }
    }
    if ([h, d, a].every(Number.isFinite)) out.push({ home, away, h, d, a });
  }
  return out;
}

app.get("/api/odds", async (req, res) => {
  try {
    const provider = req.query.provider === "parlayapi" ? "parlayapi" : "oddsapiio";
    let url;
    const headers = { accept: "application/json" };

    if (provider === "parlayapi") {
      if (!process.env.PARLAY_API_KEY) {
        return res.status(503).json({ error: "PARLAY_API_KEY is not configured on the server." });
      }
      url = "https://parlay-api.com/v1/sports/soccer/odds?regions=eu&markets=h2h&bookmakers=betway";
      headers["X-API-Key"] = process.env.PARLAY_API_KEY;
    } else {
      if (!process.env.ODDS_API_IO_KEY) {
        return res.status(503).json({ error: "ODDS_API_IO_KEY is not configured on the server." });
      }
      url = "https://api.odds-api.io/v3/odds?sport=soccer&bookmaker=betway";
      headers["X-API-Key"] = process.env.ODDS_API_IO_KEY;
    }

    const response = await fetch(url, { headers });
    const text = await response.text();
    let payload;
    try { payload = JSON.parse(text); } catch { payload = { raw: text }; }

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Odds provider HTTP ${response.status}`,
        provider,
        detail: typeof payload === "object" ? payload : undefined
      });
    }

    res.json({
      provider,
      updatedAt: new Date().toISOString(),
      matches: normalizeOdds(payload)
    });
  } catch (error) {
    res.status(502).json({ error: `Odds relay error: ${error.message}` });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Euro20 V3 listening on ${HOST}:${PORT}`);
});
