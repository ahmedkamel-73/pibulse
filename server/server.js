import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let currentPrice = 0.38;
let roundStartPrice = 0.38;
let roundId = 1;
let predictions = []; // {user, dir, priceAt, roundId, time}
let leaderboard = {}; // {username: xp}

async function getPiPrice(){
  try{
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd');
    const d = await r.json();
    currentPrice = d['pi-network'].usd;
  }catch(e){ console.log('price error'); }
}

// كل 60 ثانية اقفل الجولة واحسب الفايز
setInterval(async () => {
  const oldPrice = roundStartPrice;
  await getPiPrice();
  const newPrice = currentPrice;

  // احسب الفائزين بشفافية
  predictions.filter(p => p.roundId === roundId).forEach(p => {
    const win = (p.dir === 'up' && newPrice > oldPrice) || (p.dir === 'down' && newPrice < oldPrice);
    if(win){
      leaderboard[p.user] = (leaderboard[p.user] || 0) + 10;
    }
  });

  console.log(`Round ${roundId} closed: ${oldPrice} -> ${newPrice} | Winners: ${Object.keys(leaderboard).length}`);

  roundId++;
  roundStartPrice = newPrice;
  predictions = predictions.filter(p => p.roundId >= roundId - 5); // نحتفظ باخر 5 جولات للشفافية

}, 60000);

app.get('/api/price', (req,res)=>{
  res.json({ price: currentPrice, roundId, roundStartPrice, time: new Date() });
});

app.post('/api/predict', (req,res)=>{
  const { user, dir } = req.body;
  predictions.push({ user: user || 'anon', dir, priceAt: currentPrice, roundId, time: new Date().toISOString() });
  res.json({ ok:true, roundId, priceAt: currentPrice });
});

app.get('/api/leaderboard', (req,res)=>{
  const sorted = Object.entries(leaderboard).sort((a,b)=>b[1]-a[1]).slice(0,20);
  res.json({ leaderboard: sorted, predictions: predictions.slice(-20) }); // اخر 20 توقع للشفافية
});

app.get('/api/round', (req,res)=>{
  res.json({ roundId, roundStartPrice, currentPrice, predictions: predictions.filter(p=>p.roundId===roundId) });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log('PIBULSE Server running on '+PORT));
