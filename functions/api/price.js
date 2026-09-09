export async function onRequestGet() {
  const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd");
  const data = await res.json();
  return new Response(JSON.stringify({ price: data["pi-network"].usd }), { headers: {"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});
}
