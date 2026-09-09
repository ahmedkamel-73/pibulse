export async function onRequestPost({ request, env }) {
  const { paymentId, txid } = await request.json();
  const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
    method: 'POST',
    headers: { 'Authorization': `Key ${env.PI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ txid })
  });
  return new Response(await res.text(), { status: res.status });
}
