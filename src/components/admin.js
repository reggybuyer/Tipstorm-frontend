import React, { useEffect, useState, useCallback } from "react";

const API = process.env.REACT_APP_API_BASE || "https://tipstorm-backend.onrender.com";

export default function Admin() {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [slips, setSlips] = useState([]);
  const [games, setGames] = useState([]);
  const [date, setDate] = useState("");
  const [access, setAccess] = useState("free");
  const [page, setPage] = useState(1);
  const limit = 10;

  const badge = (access) => {
    if (access === "free") return "🟢 FREE";
    if (access === "weekly") return "🟡 WEEKLY";
    if (access === "monthly") return "🟠 MONTHLY";
    if (access === "vip") return "🔴 VIP";
    return access;
  };

  /* ---------------- LOAD DATA ---------------- */
  const loadUsers = useCallback(async () => {
    const res = await fetch(`${API}/all-users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(data.users || []);
  }, [token]);

  const loadRequests = useCallback(async () => {
    const res = await fetch(`${API}/subscription-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setRequests(data.requests || []);
  }, [token]);

  const loadSlips = useCallback(
    async (newPage = 1) => {
      const res = await fetch(`${API}/slips?page=${newPage}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSlips(data.slips || []);
      setPage(newPage);
    },
    [limit, token]
  );

  /* ---------------- USERS ---------------- */
  const deleteUser = useCallback(
    async (id) => {
      if (!window.confirm("Delete this user?")) return;
      await fetch(`${API}/delete-user/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadUsers();
    },
    [token, loadUsers]
  );

  /* ---------------- REQUESTS ---------------- */
  const approve = useCallback(
    async (id, expiryDate) => {
      if (expiryDate && new Date(expiryDate) > new Date()) {
        alert("User still active");
        return;
      }
      await fetch(`${API}/approve-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requestId: id }),
      });
      alert("User activated");
      loadRequests();
      loadUsers();
    },
    [token, loadRequests, loadUsers]
  );

  /* ---------------- SLIPS ---------------- */
  const deleteSlip = useCallback(
    async (id) => {
      if (!window.confirm("Delete this slip?")) return;
      await fetch(`${API}/delete-slip/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadSlips(page);
    },
    [token, loadSlips, page]
  );

  const markResult = useCallback(
    async (slipId, index, result) => {
      await fetch(`${API}/slip-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slipId, gameIndex: index, result }),
      });
      loadSlips(page);
    },
    [token, loadSlips, page]
  );

  const calculateTotalOdds = (games) =>
    games.reduce((acc, g) => acc * (parseFloat(g.odd) || 1), 1).toFixed(2);

  /* ---------------- CREATE SLIP ---------------- */
  const addGameRow = () => setGames([...games, { home: "", away: "", odd: "", type: "" }]);

  const updateGame = (index, field, value) => {
    const updated = [...games];
    updated[index][field] = value;
    setGames(updated);
  };

  const createSlip = async () => {
    if (!games.length) {
      alert("Add at least one game");
      return;
    }
    const body = {
      date,
      access,
      totalOdds: calculateTotalOdds(games),
      games: games.map((g) => ({
        home: g.home || "Team A",
        away: g.away || "Team B",
        odds: parseFloat(g.odd) || 1,
        type: g.type || "Over 1.5",
        result: "pending",
      })),
    };
    const res = await fetch(`${API}/slips`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      alert("Slip created");
      setGames([]);
      setDate("");
      loadSlips(page);
    } else {
      alert("Failed to create slip");
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      window.location.href = "/admin-login";
      return;
    }
    loadUsers();
    loadRequests();
    loadSlips(1);
  }, [loadUsers, loadRequests, loadSlips]);

  /* ---------------- UI ---------------- */
  return (
    <div className="section">
      <div className="header-row">
        <h2>Admin Dashboard</h2>
        <button className="btn btn-logout" onClick={logout}>Logout</button>
      </div>

      {/* USERS */}
      <div className="card">
        <h3>Users</h3>
        {users.map((u) => (
          <div key={u._id} className="game-row">
            <span>{u.email}</span>
            <span className={`plan-badge plan-${u.plan}`}>{u.plan.toUpperCase()}</span>
            <span>Expiry: {u.expiresAt ? new Date(u.expiresAt).toDateString() : "No expiry"}</span>
            <button className="btn btn-logout" onClick={() => deleteUser(u._id)}>Delete</button>
          </div>
        ))}
      </div>

      {/* REQUESTS */}
      <div className="card">
        <h3>Subscription Requests</h3>
        {requests.map((r) => (
          <div key={r._id} className="game-row">
            <span>{r.email}</span>
            <span className={`plan-badge plan-${r.plan}`}>{r.plan.toUpperCase()}</span>
            <button className="btn btn-view" onClick={() => approve(r._id, r.expiryDate)}>Activate</button>
          </div>
        ))}
      </div>

      {/* CREATE SLIP */}
      <div className="card">
        <h3>Create Slip</h3>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <select value={access} onChange={(e) => setAccess(e.target.value)}>
          <option value="free">Free</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="vip">VIP</option>
        </select>

        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Home</th>
              <th>Away</th>
              <th>Odd</th>
              <th>Type</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {games.map((g, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td><input value={g.home} onChange={(e) => updateGame(i, "home", e.target.value)} /></td>
                <td><input value={g.away} onChange={(e) => updateGame(i, "away", e.target.value)} /></td>
                <td><input value={g.odd} type="number" onChange={(e) => updateGame(i, "odd", e.target.value)} className="odd-box"/></td>
                <td><input value={g.type} onChange={(e) => updateGame(i, "type", e.target.value)} placeholder="Over 1.5" className="plan-badge"/></td>
                <td>
                  <button onClick={() => { const updated = [...games]; updated.splice(i,1); setGames(updated); }}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addGameRow} className="btn btn-view">Add Game</button>
        <button onClick={createSlip} className="btn btn-primary">Create Slip</button>
      </div>

      {/* SLIPS */}
      <div className="card">
        <h3>Slips</h3>
        {slips.map((slip) => (
          <div key={slip._id} className="slip-card">
            <div className="slip-header">
              <strong>{slip.date}</strong>
              <span className={`plan-badge plan-${slip.access}`}>{badge(slip.access)}</span>
              <span>Total Odds: {parseFloat(slip.totalOdds).toFixed(2)}</span>
              <button className="btn btn-logout" onClick={() => deleteSlip(slip._id)}>Delete Slip</button>
            </div>
            {slip.games?.map((g, i) => (
              <div key={i} className="game-row">
                <span>{g.home} vs {g.away}</span>
                <span>
                  <span className="odd-box">{(parseFloat(g.odds) || 1).toFixed(2)}</span> |
                  <span className={`plan-badge plan-${g.type.toLowerCase().replace(/\s/g,'')}`}>{g.type}</span>
                </span>
                <span className={
                  g.result === "won" ? "result-win" :
                  g.result === "lost" ? "result-loss" :
                  "result-pending"
                }>
                  {g.result === "won" ? "✅ Won" : g.result === "lost" ? "❌ Lost" : "⏳ Pending"}
                </span>
                <button className="btn btn-view" onClick={() => markResult(slip._id, i, "won")}>Won</button>
                <button className="btn btn-logout" onClick={() => markResult(slip._id, i, "lost")}>Lost</button>
              </div>
            ))}
          </div>
        ))}
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => loadSlips(page - 1)}>Prev</button>
          <span>Page {page}</span>
          <button disabled={slips.length < limit} onClick={() => loadSlips(page + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
} 
