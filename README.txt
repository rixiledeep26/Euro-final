EURO20 500-ODDS OVERSEER — FINAL ANDROID V3 (RENDER-READY)
============================================================
This version is deliberately structured for a root-level Render Node web service.

IMPORTANT
- Analysis/prediction only. It does not log into Betway, place bets, cash out, or manage stakes.
- 500.00 is a research target, not a guarantee. The engine may return NO VALID 500 SET.
- Never put a Betway username/password into this project.

FILES
All required web files and Node files are at the repository root so Render can run:
  npm install
  npm start

RENDER
- Service: Web Service
- Branch: main
- Root Directory: blank
- Build Command: npm install
- Start Command: npm start
- Plan: Free
- Environment variable: ODDS_API_IO_KEY = your provider key
  (or PARLAY_API_KEY if using ParlayAPI)

The app listens on Render's PORT and 0.0.0.0 automatically.
Health check: /health

ANDROID
After Render shows Live, open the HTTPS onrender.com URL in Chrome on Android.
Use Chrome's menu to install/add the web app to the home screen.
