export async function onRequestPost({ request }) {
  const body = await request.json();
  // هنا بتحفظ username + wallet + prediction
  return new Response(JSON.stringify({ ok: true, saved: body }), { headers: {"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});
}
