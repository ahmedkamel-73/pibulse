# PIBULSE - Pi Live Prediction Game

Real-time, transparent, wallet-linked PI price prediction game built for Pi Network Hackathon 2026.

## Features
- LIVE PI price from CoinGecko (no demo)
- Pi Wallet Authentication (username + wallet_address + uid)
- Transparent winner calculation every 60s on Cloudflare Worker
- Pi Ad Network integration (Pi.Ads)
- Daily free points (10) - No Pi payment required - Skill based
- Bilingual EN/AR, English digits

## How winner is determined (Transparency)
1. Server saves roundStartPrice
2. Users connect Pi Wallet and predict UP/DOWN
3. After 60s, server fetches new PI price
4. If prediction matches price movement, +10 XP
5. Leaderboard public at /api/round and /api/leaderboard
6. Top winner wallet ready for Pi payment from App Wallet GD2C...RYDO

## Tech
- Frontend: public/index.html (Pi SDK 2.0)
- Backend: server/server.js (Cloudflare Pages Functions)
- APIs: /api/price, /api/predict, /api/round, /api/leaderboard

## Deployment
Connect GitHub repo to Cloudflare Pages.
Set env var: PI_API_KEY = your Pi API key from developer portal.
Cron: Worker scheduled every 60s to close round and calculate winners.

## Legal
See /about.html and /terms.html

Built for Pi - Skill based - Free - Transparent
