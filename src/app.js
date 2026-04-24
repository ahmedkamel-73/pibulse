import React, { useState, useEffect } from 'react';

function App() {
  const [piUser, setPiUser] = useState(null);
  const [piSDKReady, setPiSDKReady] = useState(false);
  const [balance, setBalance] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [showAuth, setShowAuth] = useState(true);
  const [waiting, setWaiting] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  
  let users = {};
  let predictions = [];

  const loadData = () => {
    const saved = localStorage.getItem('pibulse_users');
    if (saved) users = JSON.parse(saved);
    const savedPred = localStorage.getItem('pibulse_predictions');
    if (savedPred) predictions = JSON.parse(savedPred);
  };

  const saveData = () => {
    localStorage.setItem('pibulse_users', JSON.stringify(users));
    localStorage.setItem('pibulse_predictions', JSON.stringify(predictions));
  };

  useEffect(() => {
    const checkSDK = () => {
      if (typeof Pi !== 'undefined' && Pi.init) {
        setPiSDKReady(true);
      } else {
        setTimeout(checkSDK, 500);
      }
    };
    checkSDK();
    loadData();
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrice = async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd');
      const data = await res.json();
      setCurrentPrice(data['pi-network']?.usd || 0);
    } catch(e) {}
  };

  const authenticateWithPi = async () => {
    if (!piSDKReady) return alert('Please open in Pi Browser');
    try {
      Pi.init({ version: "2.0", apiKey: "uwulfhhbzrvg4afol8in1yc9dvjpqpqnnhmw0gmrgsifhbnhnuhjzusiilxlsneo" });
      const auth = await Pi.authenticate(['username', 'payments']);
      if (auth && auth.user) {
        const username = auth.user.username || `Pioneer_${auth.user.uid.slice(0, 8)}`;
        setPiUser({ uid: auth.user.uid, username });
        if (!users[auth.user.uid]) {
          users[auth.user.uid] = { username, balance: 10, weeklyCorrect: 0, weeklyTotal: 0 };
          saveData();
        }
        setBalance(users[auth.user.uid].balance);
        setShowAuth(false);
        updateLeaderboard();
      }
    } catch(error) { alert('Login failed'); }
  };

  const getCurrentRound = () => {
    const now = new Date();
    const hours = now.getUTCHours();
    const roundNumber = Math.floor(hours / 6) + 1;
    const endTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), roundNumber * 6, 0, 0));
    if (endTime <= now) endTime.setUTCDate(endTime.getUTCDate() + 1);
    return { id: `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}-R${roundNumber}`, endTime };
  };

  const waitForConfirmation = async (paymentId, maxAttempts = 15) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const payment = await Pi.getPayment(paymentId);
        if (payment && payment.status === 'completed') return true;
        await new Promise(r => setTimeout(r, 2000));
      } catch(e) {}
    }
    return false;
  };

  const enterRound = async (direction) => {
    if (!piUser) return;
    const userData = users[piUser.uid];
    const round = getCurrentRound();
    const existing = predictions.find(p => p.uid === piUser.uid && p.roundId === round.id);
    if (existing) return alert('You already joined this round!');
    if (userData.balance < 1) return alert('Insufficient balance!');
    
    setWaiting(true);
    try {
      const payment = { amount: 1, memo: `Round Entry ${round.id}`, to: "GD2CLBUZPQJV2PY35YYB5JWILDVSFCGDCIJTNEG5RYU7YBGQ7EDBRYDO", metadata: { uid: piUser.uid, roundId: round.id, direction } };
      const result = await Pi.createPayment(payment);
      if (!result || !result.identifier) throw new Error();
      const confirmed = await waitForConfirmation(result.identifier);
      if (!confirmed) throw new Error();
      
      userData.balance -= 1;
      setBalance(userData.balance);
      predictions.push({ uid: piUser.uid, roundId: round.id, direction, priceAtPrediction: currentPrice, timestamp: Date.now(), processed: false });
      saveData();
      
      const timeToEnd = round.endTime - new Date();
      if (timeToEnd > 0 && timeToEnd < 3600000) setTimeout(() => calculateRoundResult(round.id), Math.max(1000, timeToEnd));
    } catch(error) { alert('Payment failed'); }
    setWaiting(false);
  };

  const calculateRoundResult = async (roundId) => {
    const finalPrice = await fetchPrice();
    const roundPredictions = predictions.filter(p => p.roundId === roundId && !p.processed);
    for (const pred of roundPredictions) {
      const actualMovement = finalPrice > pred.priceAtPrediction ? 'up' : 'down';
      const isCorrect = pred.direction === actualMovement;
      if (users[pred.uid]) {
        if (isCorrect) { users[pred.uid].balance += 1.05; users[pred.uid].weeklyCorrect += 1; }
        users[pred.uid].weeklyTotal += 1;
        pred.processed = true;
      }
    }
    saveData();
    if (piUser && users[piUser.uid]) setBalance(users[piUser.uid].balance);
    updateLeaderboard();
  };

  const updateLeaderboard = () => {
    const list = Object.keys(users).map(uid => ({
      username: users[uid].username,
      correct: users[uid].weeklyCorrect || 0,
      total: users[uid].weeklyTotal || 0,
      accuracy: users[uid].weeklyTotal > 0 ? ((users[uid].weeklyCorrect / users[uid].weeklyTotal) * 100).toFixed(1) : 0
    }));
    list.sort((a, b) => { if (b.accuracy === a.accuracy) return b.correct - a.correct; return b.accuracy - a.accuracy; });
    setLeaderboard(list.slice(0, 10));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const round = getCurrentRound();
      const diff = round.endTime - new Date();
      if (diff <= 0) window.location.reload();
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (showAuth) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div style={{ background: '#1e2329', padding: 20, borderRadius: 15, maxWidth: 400, margin: 'auto' }}>
          <h2 style={{ color: '#ffa500' }}>🚀 PiBULSE</h2>
          <p>🎯 Predict Pi Price | 💰 Win 5 π Weekly</p>
          <button onClick={authenticateWithPi} style={{ background: '#ffa500', color: '#000', padding: 12, borderRadius: 10, width: '100%', border: 'none', fontWeight: 'bold' }}>🔐 Sign in with Pi Network</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 15, maxWidth: 500, margin: 'auto', textAlign: 'center' }}>
      <div style={{ background: '#1e2329', padding: 20, borderRadius: 15, marginBottom: 15 }}>
        <p>👤 {piUser?.username}</p>
        <p>Your Balance</p>
        <div style={{ fontSize: 32, color: '#ffd700', fontWeight: 'bold' }}>{balance.toFixed(2)} π</div>
      </div>
      <div style={{ background: '#1e2329', padding: 20, borderRadius: 15, marginBottom: 15 }}>
        <div style={{ fontSize: 18 }}>⏰ Round ends: {timeLeft}</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', margin: 15, color: '#ffa500' }}>${currentPrice.toFixed(4)}</div>
        {!waiting ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => enterRound('up')} style={{ background: '#28a745', color: 'white', padding: 12, borderRadius: 10, flex: 1, border: 'none', fontWeight: 'bold' }}>🚀 UP</button>
            <button onClick={() => enterRound('down')} style={{ background: '#dc3545', color: 'white', padding: 12, borderRadius: 10, flex: 1, border: 'none', fontWeight: 'bold' }}>📉 DOWN</button>
          </div>
        ) : (
          <div><div style={{ display: 'inline-block', width: 25, height: 25, border: '2px solid #28a745', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div><p style={{ color: '#28a745' }}>Processing payment...</p></div>
        )}
      </div>
      <div style={{ background: '#1e2329', padding: 20, borderRadius: 15 }}>
        <h3 style={{ color: '#ffa500' }}>🏆 Weekly Leaderboard</h3>
        <table style={{ width: '100%' }}><thead><tr><th>User</th><th>✅ Correct</th><th>🎯 Accuracy</th></tr></thead><tbody>
          {leaderboard.map((u, i) => <tr key={i}><td>{i===0?'👑 ':''}{u.username}</td><td>{u.correct}/{u.total}</td><td>{u.accuracy}%</td></tr>)}
        </tbody></table>
      </div>
      <button onClick={() => { setPiUser(null); setShowAuth(true); }} style={{ background: '#dc3545', color: 'white', padding: 12, borderRadius: 10, width: '100%', marginTop: 15, border: 'none' }}>🚪 Sign Out</button>
    </div>
  );
}

export default App;
