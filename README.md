# PIBULSE - PI Prediction Game

Live PI price prediction - Skill based - Free

## Structure
- public/index.html - Game UI
- public/manifest.json - Pi Browser
- server/server.js - Cloudflare Worker (calculates winner automatically every 60s)

## How winner calculated (Transparent)
1. Server saves start price
2. Users predict UP/DOWN
3. After 60s server gets new price and auto awards XP
4. Leaderboard public at /api/leaderboard

## Deploy to Cloudflare Pages
Connect GitHub repo, it will deploy automatically.

Built for Pi Network Hackathon
