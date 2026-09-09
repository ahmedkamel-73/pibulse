export async function onRequestPost({ request, env }) {
  const { paymentId } = await request.json();
  const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
    method: 'POST',
    headers: { 'Authorization': `Key ${env.PI_API_KEY}` }
  });
  return new Response(await res.text(), { status: res.status });
}
