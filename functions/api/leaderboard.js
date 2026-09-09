export async function onRequestGet() {
  return new Response(JSON.stringify([]), { headers: {"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});
}
