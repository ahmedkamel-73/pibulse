function getCairoNow() {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
}
function getRoundsSchedule(cairoNow) {
  const base = new Date(cairoNow);
  base.setHours(0,0,0,0);
  return [
    new Date(base.getTime()),
    new Date(base.getTime() + 6*60*60*1000),
    new Date(base.getTime() + 12*60*60*1000),
    new Date(base.getTime() + 18*60*60*1000),
  ];
}
if (!globalThis.pibulseStore) {
  globalThis.pibulseStore = {
    roundId: 1,
    roundStartPrice: 0.0980,
    predictions: [],
    currentPrice: 0.0980
  };
}
export async function onRequestGet() {
  const store = globalThis.pibulseStore;
  const cairoNow = getCairoNow();
  const todayRounds = getRoundsSchedule(cairoNow);
  let nextRound = todayRounds.find(r => r > cairoNow);
  if (!nextRound) {
    const tomorrow = new Date(cairoNow);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0,0,0,0);
    nextRound = tomorrow;
  }
  const lockTime = new Date(nextRound.getTime() - 30*60*1000);
  const isLocked = cairoNow >= lockTime;
  const roundIdStr = nextRound.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }) + '-' + nextRound.getHours();
  return new Response(JSON.stringify({
    roundId: roundIdStr,
    roundStartPrice: store.roundStartPrice,
    currentPrice: store.currentPrice,
    predictions: store.predictions.slice(-20),
    nextRound: nextRound.toISOString(),
    nextRoundCairo: nextRound.toLocaleString('ar-EG', { timeZone: 'Africa/Cairo', hour12: false }),
    lockTime: lockTime.toISOString(),
    isLocked: isLocked,
    secondsUntilNext: Math.floor((nextRound - cairoNow)/1000),
    secondsUntilLock: Math.floor((lockTime - cairoNow)/1000),
    schedule: ["00:00","06:00","12:00","18:00 Africa/Cairo"]
  }), {
    headers: { "Content-Type":"application/json", "Access-Control-Allow-Origin":"*", "Cache-Control":"no-store" }
  });
}
