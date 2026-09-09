export async function onRequestGet() {
  const now = new Date();
  const cairoNow = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
  
  const base = new Date(cairoNow);
  base.setHours(0,0,0,0);
  
  const rounds = [
    new Date(base.getTime()),
    new Date(base.getTime() + 6*60*60*1000),
    new Date(base.getTime() + 12*60*60*1000),
    new Date(base.getTime() + 18*60*60*1000),
  ];
  
  let nextRound = rounds.find(r => r > cairoNow);
  if (!nextRound) {
    const tomorrow = new Date(base);
    tomorrow.setDate(tomorrow.getDate()+1);
    nextRound = tomorrow;
  }
  
  const lockTime = new Date(nextRound.getTime() - 30*60*1000);
  const isLocked = cairoNow >= lockTime;

  return new Response(JSON.stringify({
    roundId: nextRound.getHours() + ":00 Cairo",
    roundStartPrice: 0.0955,
    predictions: [],
    nextRound: nextRound.toISOString(),
    nextRoundCairo: nextRound.toLocaleString('ar-EG', {timeZone:'Africa/Cairo'}),
    lockTime: lockTime.toISOString(),
    isLocked: isLocked,
    secondsUntilNext: Math.floor((nextRound - cairoNow)/1000),
    secondsUntilLock: Math.floor((lockTime - cairoNow)/1000),
    schedule: ["00:00","06:00","12:00","18:00 Africa/Cairo"]
  }), {
    headers: { "Content-Type":"application/json", "Access-Control-Allow-Origin":"*", "Cache-Control":"no-store" }
  });
}
