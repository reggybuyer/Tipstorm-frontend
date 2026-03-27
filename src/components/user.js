import React, { useEffect, useState, useCallback } from "react";

const API = process.env.REACT_APP_API_BASE || "https://tipstorm-backend.onrender.com/";

export default function User() {
  const [slips, setSlips] = useState([]);
  const [user, setUser] = useState(null);
  const [planSelect, setPlanSelect] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  /* ---------------- LOAD PROFILE ---------------- */
  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success || !data.user) {
        logout();
        return;
      }
      setUser(data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]);

  /* ---------------- LOAD SLIPS ---------------- */
  const loadSlips = useCallback(async () => {
    try {
      const res = await fetch(`${API}/slips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSlips(data.slips || []);
    } catch {
      setSlips([]);
    }
  }, [token]);

  /* ---------------- PLAN INFO ---------------- */
  const getRemainingDays = () => {
    if (!user?.expiresAt) return 0;
    return Math.max(0, Math.ceil((new Date(user.expiresAt) - new Date()) / 86400000));
  };

  const getAmount = () => {
    if (planSelect === "weekly") return 500;
    if (planSelect === "monthly") return 1000;
    if (planSelect === "vip") return 1500;
    return 0;
  };

  const requestActivation = async () => {
    await fetch(`${API}/request-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, plan: planSelect, message: "User requested upgrade" }),
    });
    alert("Request sent. Send payment message to WhatsApp.");
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    loadProfile();
    loadSlips();
  }, [token, loadProfile, loadSlips]);

  if (loading) return <div className="section">Loading...</div>;
  if (!user) return <div className="section">Session expired.</div>;

  /* ---------------- UI ---------------- */
  return (
    <div className="section">
      <div className="header-row">
        <h2>Welcome, {user.email}</h2>
        <button className="btn btn-logout" onClick={logout}>Logout</button>
      </div>

      {/* User Plan */}
      <div className="card premium-card">
        <span className={`plan-badge plan-${user.plan}`}>{user.plan.toUpperCase()} PLAN</span>
        <p>Expires: {user.expiresAt ? new Date(user.expiresAt).toDateString() : "No expiry"}</p>
        <p>Remaining: {getRemainingDays()} days</p>
        {user.plan !== "vip" && (
          <div className="upgrade-card">
            <h4>Upgrade your plan</h4>
            <select value={planSelect} onChange={(e) => setPlanSelect(e.target.value)}>
              <option value="weekly">Weekly - Ksh 500</option>
              <option value="monthly">Monthly - Ksh 1000</option>
              <option value="vip">VIP - Ksh 1500</option>
            </select>
            <div className="amount-display">Amount: <strong>Ksh {getAmount()}</strong></div>
            <div className="manual-payment">
              <p>Playbill: <strong>625625</strong></p>
              <p>Acc Number: <strong>20170457</strong></p>
              <p>Send your <strong>{user.email}</strong> and payment confirmation to WhatsApp: <strong>0789906001</strong></p>
            </div>
            <button className="btn btn-upgrade" onClick={requestActivation}>Request Upgrade</button>
          </div>
        )}
      </div>

      {/* Slips */}
      <div className="card">
        <h3>Available Slips</h3>
        {slips.length === 0 ? (
          <p>No slips available</p>
        ) : (
          slips.map((slip) => {
            const allowed = slip.access === "free" || (user?.premium && (user.plan === "vip" || user.plan === slip.access));
            return (
              <div key={slip._id} className="slip-card">
                <div className="slip-header">
                  <strong>{slip.date}</strong>{" "}
                  <span className={`plan-badge plan-${slip.access}`}>{slip.access.toUpperCase()}</span>{" "}
                  <span>Total Odds: <span className="odd-box">{(slip.totalOdds || 1).toFixed(2)}</span></span>
                </div>
                {allowed ? (
                  <table className="slip-games-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Home</th>
                        <th>Away</th>
                        <th>Odd</th>
                        <th>Type</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slip.games.map((g, i) => {
                        const hideForFree = user?.plan === "free" && slip.access === "free" && (i === 0 || i === 1); // hide 1 and 2
                        return (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{g.home}</td>
                            <td>{g.away}</td>
                            <td>{hideForFree ? "—" : <span className="odd-box">{(parseFloat(g.odds) || 1).toFixed(2)}</span>}</td>
                            <td>{hideForFree ? "Premium" : <span className={`plan-badge plan-${g.type.toLowerCase().replace(/\s/g, '')}`}>{g.type}</span>}</td>
                            <td className={
                              g.result === "won" ? "result-win" :
                              g.result === "lost" ? "result-loss" :
                              "result-pending"
                            }>
                              {g.result === "won" ? "✅ Won" : g.result === "lost" ? "❌ Lost" : "⏳ Pending"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div>🔒 Premium content</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 
