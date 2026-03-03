import React, { useEffect, useState } from "react";

const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [date, setDate] = useState("");
  const [access, setAccess] = useState("free");
  const [requests, setRequests] = useState([]);
  const [slips, setSlips] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [editSlip, setEditSlip] = useState(null);

  const token = localStorage.getItem("token");
  const limit = 10;

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      window.location.href = "/admin-login";
    }
  }, []);

  function logout() {
    localStorage.clear();
    window.location.href = "/";
  }

  /* USERS */
  async function loadUsers() {
    try {
      const res = await fetch(`${API}/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch {}
  }

  /* REQUESTS */
  async function loadRequests() {
    try {
      const res = await fetch(`${API}/subscription-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRequests(data.requests || []);
    } catch {}
  }

  async function approve(id) {
    await fetch(`${API}/approve-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requestId: id }),
    });
    alert("User activated");
    loadRequests();
  }

  /* CREATE SLIP */
  function addGame() {
    setGames([
      ...games,
      { home: "", away: "", odd: 1, type: "Over", line: "2.5", result: "pending" },
    ]);
  }

  function updateGame(index, field, value) {
    const updated = [...games];
    updated[index][field] = value;
    setGames(updated);
  }

  async function createSlip() {
    if (!date) return alert("Select date");
    if (games.length === 0) return alert("Add at least one game");

    const totalOdds = games.reduce((acc, g) => acc * (parseFloat(g.odd) || 1), 1);
    if (totalOdds < 2) return alert("Minimum total odds is 2");

    await fetch(`${API}/slips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ date, games, access, totalOdds }),
    });

    alert("Slip created");
    setGames([]);
    setDate("");
    loadSlips(1);
  }

  /* LOAD SLIPS */
  async function loadSlips(newPage = 1) {
    try {
      const res = await fetch(`${API}/slips?page=${newPage}&limit=${limit}`);
      const data = await res.json();
      setSlips(data.slips || []);
      setPages(data.pages || 1);
      setPage(newPage);
    } catch {}
  }

  /* DELETE SLIP */
  async function deleteSlip(id) {
    if (!window.confirm("Delete slip?")) return;
    await fetch(`${API}/slips/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadSlips(page);
  }

  /* EDIT SLIP */
  function startEdit(slip) {
    setEditSlip(slip);
    setDate(slip.date);
    setAccess(slip.access);
    setGames(slip.games);
  }

  async function saveEdit() {
    if (!editSlip) return;

    const totalOdds = games.reduce((acc, g) => acc * (parseFloat(g.odd) || 1), 1);

    await fetch(`${API}/slips/${editSlip._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ date, access, games, totalOdds }),
    });

    alert("Slip updated");
    setEditSlip(null);
    setGames([]);
    setDate("");
    loadSlips(page);
  }

  async function markResult(slipId, index, result) {
    await fetch(`${API}/slip-result`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ slipId, gameIndex: index, result }),
    });
    loadSlips(page);
  }

  return (
    <div className="section">
      <div className="header-row">
        <h2>Admin Dashboard</h2>
        <button className="btn btn-logout" onClick={logout}>
          Logout
        </button>
      </div>

      <h3>Total Users: {users.length}</h3>
      <h3>Total Requests: {requests.length}</h3>
      <h3>Total Slips: {slips.length}</h3>

      {/* CREATE / EDIT SLIP */}
      <div className="card">
        <h3>{editSlip ? "Edit Slip" : "Create Slip"}</h3>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <select value={access} onChange={(e) => setAccess(e.target.value)}>
          <option value="free">Free</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="vip">VIP</option>
        </select>

        {games.map((g, i) => (
          <div key={i} className="game-row">
            <input
              placeholder="Home"
              value={g.home}
              onChange={(e) => updateGame(i, "home", e.target.value)}
            />
            <input
              placeholder="Away"
              value={g.away}
              onChange={(e) => updateGame(i, "away", e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Odd"
              value={g.odd}
              onChange={(e) => updateGame(i, "odd", e.target.value)}
            />
            <select value={g.type} onChange={(e) => updateGame(i, "type", e.target.value)}>
              <option value="Over">Over</option>
              <option value="Under">Under</option>
            </select>
            <input
              placeholder="Line"
              value={g.line}
              onChange={(e) => updateGame(i, "line", e.target.value)}
            />
          </div>
        ))}

        <button className="btn" onClick={addGame}>Add Game</button>

        {editSlip ? (
          <button className="btn btn-upgrade" onClick={saveEdit}>
            Save Edit
          </button>
        ) : (
          <button className="btn btn-upgrade" onClick={createSlip}>
            Create Slip
          </button>
        )}
      </div>

      {/* USERS */}
      <div className="card">
        <h3>Users</h3>
        <button className="btn" onClick={loadUsers}>Load Users</button>
        {users.map((u) => (
          <div key={u.email}>
            <strong>{u.email}</strong>
            <p>Plan: {u.plan}</p>
          </div>
        ))}
      </div>

      {/* REQUESTS */}
      <div className="card">
        <h3>Requests</h3>
        <button className="btn" onClick={loadRequests}>Load Requests</button>
        {requests.map((r) => (
          <div key={r._id}>
            <strong>{r.email}</strong>
            <p>Plan: {r.plan}</p>
            <button className="btn btn-view" onClick={() => approve(r._id)}>
              Activate
            </button>
          </div>
        ))}
      </div>

      {/* SLIPS */}
      <div className="card">
        <h3>Slips</h3>
        <button className="btn" onClick={() => loadSlips(1)}>
          Load Slips
        </button>

        {slips.map((slip) => (
          <div key={slip._id} className="slip-card">
            <div className="slip-header">
              <p>{slip.date} — {slip.access?.toUpperCase()}</p>
              <div>
                <button className="btn btn-view" onClick={() => startEdit(slip)}>
                  Edit
                </button>
                <button className="btn btn-logout" onClick={() => deleteSlip(slip._id)}>
                  Delete
                </button>
              </div>
            </div>

            {slip.games.map((g, i) => (
              <div key={i} className="game-row">
                <span>{g.home} vs {g.away}</span>
                <span>{g.type ? `${g.type} ${g.line}` : g.overUnder || ""}</span>
                <span>Odd: {g.odd}</span>

                <span
                  className={
                    g.result === "win"
                      ? "badge-win"
                      : g.result === "lost"
                      ? "badge-lost"
                      : "badge-pending"
                  }
                >
                  {g.result || "pending"}
                </span>

                <button className="badge-win" onClick={() => markResult(slip._id, i, "win")}>
                  Won
                </button>
                <button className="badge-lost" onClick={() => markResult(slip._id, i, "lost")}>
                  Lost
                </button>
              </div>
            ))}
          </div>
        ))}

        <div className="pagination">
          <button disabled={page <= 1} onClick={() => loadSlips(page - 1)}>
            Previous
          </button>
          <span>Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => loadSlips(page + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
} 
