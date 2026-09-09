let currentPrice=0.38, roundStartPrice=0.38, roundId=1;
let predictions=[]; // {username, wallet_address, uid, dir, priceAt, roundId, time}
let leaderboard={};

async function getPiPrice(){
  try{
    const r=await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd');
    const d=await r.json(); currentPrice=d['pi-network'].usd;
  }catch{}
}

export default {
  async fetch(request, env, ctx){
    const url=new URL(request.url);
    const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json'};
    if(request.method==='OPTIONS') return new Response(null,{headers});

    if(url.pathname==='/api/price'){ await getPiPrice(); return new Response(JSON.stringify({price:currentPrice, roundId, roundStartPrice}),{headers});}

    if(url.pathname==='/api/predict' && request.method==='POST'){
      const body=await request.json();
      // هنا بنحدد الشخص الحقيقي بمحفظته
      if(!body.username ||!body.wallet_address){ return new Response(JSON.stringify({error:'Pi wallet not linked'}),{status:400, headers});}
      predictions.push({username: body.username, wallet_address: body.wallet_address, uid: body.uid, dir: body.dir, priceAt: currentPrice, roundId, time: new Date().toISOString()});
      return new Response(JSON.stringify({ok:true, roundId}),{headers});
    }

    if(url.pathname==='/api/round'){ return new Response(JSON.stringify({roundId, roundStartPrice, currentPrice, predictions: predictions.filter(p=>p.roundId===roundId)}),{headers});}
    if(url.pathname==='/api/leaderboard'){
      const sorted=Object.entries(leaderboard).sort((a,b)=>b[1]-a[1]);
      return new Response(JSON.stringify({leaderboard: sorted, predictions: predictions.slice(-20)}),{headers});
    }
    return env.ASSETS.fetch(request);
  },
  async scheduled(event, env, ctx){
    const oldPrice=roundStartPrice;
    await getPiPrice();
    const newPrice=currentPrice;
    const roundPreds=predictions.filter(p=>p.roundId===roundId);
    roundPreds.forEach(p=>{
      const win=(p.dir==='up' && newPrice>oldPrice) || (p.dir==='down' && newPrice<oldPrice);
      if(win){
        leaderboard[p.username]=(leaderboard[p.username]||0)+10;
        // هنا هتبعت Pi الحقيقي من App Wallet GD2C...RYDO الى p.wallet_address
        console.log(`WINNER: ${p.username} Wallet: ${p.wallet_address} -> Send 0.1 Pi`);
      }
    });
    roundId++; roundStartPrice=newPrice;
  }
}
