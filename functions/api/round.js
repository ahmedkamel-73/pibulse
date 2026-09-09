export async function onRequestGet() {
  const now = new Date();
  const cairoNow = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
  const base = new Date(cairoNow); base.setHours(0,0,0,0);
  const rounds = [new Date(base), new Date(base.getTime()+6*3600000), new Date(base.getTime()+12*3600000), new Date(base.getTime()+18*3600000)];
  let nextRound = rounds.find(r => r > cairoNow);
  if (!nextRound) { const t = new Date(base); t.setDate(t.getDate()+1); nextRound = t; }
  const lockTime = new Date(nextRound.getTime()-30*60*1000);
  return new Response(JSON.stringify({
    roundId: nextRound.getHours()+":00",
    roundStartPrice: 0.0955,
    predictions: [],
    nextRound: nextRound.toISOString(),
    lockTime: lockTime.toISOString(),
    isLocked: cairoNow >= lockTime,
    secondsUntilNext: Math.floor((nextRound - cairoNow)/1000),
    secondsUntilLock: Math.floor((lockTime - cairoNow)/1000)
  }), { headers: { "Content-Type":"application/json", "Access-Control-Allow-Origin":"*", "Cache-Control":"no-store" } });
}
