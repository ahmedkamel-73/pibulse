export async function onRequestPost({ request }) {
  const body = await request.json();
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type":"application/json", "Access-Control-Allow-Origin":"*" }
  });
}
export async function onRequestOptions() {
  return new Response(null, {
    headers: { "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Methods":"POST, OPTIONS", "Access-Control-Allow-Headers":"Content-Type" }
  });
}
