function getCairoNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
}
function getRoundsForToday(cairoDate) {
  const base = new Date(cairoDate);
  base.setHours(0,0,0,0);
  return [
    new Date(base.getTime()), // 00:00
    new Date(base.getTime() + 6*60*60000), // 06:00
    new Date(base.getTime() + 12*60*60000), // 12:00
    new Date(base.getTime() + 18*60*60000), // 18:00
  ];
}
export async function onRequestGet() {
  const cairoNow = getCairoNow();
  const todayRounds = getRoundsForToday(cairoNow);
  
  let nextRound = todayRounds.find(r => r > cairoNow);
  if (!nextRound) {
    // بكرا 12 بليل
    const tomorrow = new Date(cairoNow);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0,0,0,0);
    nextRound = tomorrow;
  }
  
  const lockTime = new Date(nextRound.getTime() - 30*60*1000);
  const isLocked = cairoNow >= lockTime;
  
  return new Response(JSON.stringify({
    currentTimeCairo: cairoNow.toLocaleString("ar-EG", { timeZone: "Africa/Cairo" }),
    nextRound: nextRound.toISOString(),
    nextRoundCairo: nextRound.toLocaleString("ar-EG", { timeZone: "Africa/Cairo" }),
    lockTime: lockTime.toISOString(),
    isLocked: isLocked,
    secondsUntilNext: Math.floor((nextRound - cairoNow)/1000),
    secondsUntilLock: Math.floor((lockTime - cairoNow)/1000),
    roundsPerDay: 4,
    schedule: ["00:00","06:00","12:00","18:00 Africa/Cairo"]
  }), {
    headers: { "Content-Type":"application/json", "Access-Control-Allow-Origin":"*" }
  });
}
