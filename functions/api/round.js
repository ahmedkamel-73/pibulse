let round = { id: 1, startPrice: 0.0980, predictions: [] };
export async function onRequestGet() {
  return new Response(JSON.stringify(round), { headers: {"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});
}
