// Cloudflare Worker - نفس العقل بس يشتغل على Cloudflare
let currentPrice = 0.38;
let roundStartPrice = 0.38;
let roundId = 1;
let predictions = [];
let leaderboard = {};

async function getPiPrice(){
  try{
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd');
    const d = await r.json();
    currentPrice = d['pi-network'].usd;
  }catch(e){}
}

export default {
  async fetch(request, env, ctx){
    const url = new URL(request.url);

    // CORS
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };
    if(request.method === 'OPTIONS') return new Response(null, {headers});

    if(url.pathname === '/api/price'){
      await getPiPrice();
      return new Response(JSON.stringify({ price: currentPrice, roundId, roundStartPrice }), {headers});
    }

    if(url.pathname === '/api/predict' && request.method === 'POST'){
      const {user, dir} = await request.json();
      predictions.push({user, dir, priceAt: currentPrice, roundId, time: new Date().toISOString()});
      return new Response(JSON.stringify({ok:true, roundId}), {headers});
    }

    if(url.pathname === '/api/leaderboard'){
      const sorted = Object.entries(leaderboard).sort((a,b)=>b[1]-a[1]);
      return new Response(JSON.stringify({leaderboard: sorted, predictions: predictions.slice(-20)}), {headers});
    }

    // اي حاجة تانية رجع الـ index.html
    return env.ASSETS.fetch(request);
  },
  async scheduled(event, env, ctx){
    // ده اللي بيحسب الفائز كل دقيقة اتوماتيك في Cloudflare
    const oldPrice = roundStartPrice;
    await getPiPrice();
    const newPrice = currentPrice;
    predictions.filter(p=>p.roundId===roundId).forEach(p=>{
      const win = (p.dir==='up' && newPrice>oldPrice) || (p.dir==='down' && newPrice<oldPrice);
      if(win) leaderboard[p.user] = (leaderboard[p.user]||0)+10;
    });
    roundId++; roundStartPrice = newPrice;
  }
}
