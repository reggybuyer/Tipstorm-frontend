import React, { useEffect, useState, useCallback } from "react";

const API =
  process.env.REACT_APP_API_BASE ||
  "https://tipstorm-backend.onrender.com";

export default function Admin() {
  const token = localStorage.getItem("token");

  // ---------------- STATE ----------------
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [slips, setSlips] = useState([]);
  const [games, setGames] = useState([]);
  const [date, setDate] = useState("");
  const [access, setAccess] = useState("free");
  const [page, setPage] = useState(1);
  const [visitors, setVisitors] = useState([]); // ✅ NEW

  const limit = 10;

  // ---------------- HELPERS ----------------
  const badge = (access) => {
    if (access === "free") return "🟢 FREE";
    if (access === "weekly") return "🟡 WEEKLY";
    if (access === "monthly") return "🟠 MONTHLY";
    if (access === "vip") return "🔴 VIP";
    return access;
  };

  const calculateTotalOdds = (games) =>
    games.reduce((acc, g) => acc * (parseFloat(g.odd) || 1), 1).toFixed(2);

  // ---------------- LOAD DATA ----------------
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
      const res = await fetch(
        `${API}/slips?page=${newPage}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setSlips(data.slips || []);
      setPage(newPage);
    },
    [limit, token]
  );

  // ✅ NEW: LOAD VISITORS
  const loadVisitors = useCallback(async () => {
    const res = await fetch(`${API}/visitors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setVisitors(data.visitors || []);
  }, [token]);

  // ---------------- USERS ----------------
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

  // ---------------- REQUESTS ----------------
  const approve = useCallback(
    async (id, expiryDate) => {
      if (expiryDate && new Date(expiryDate) > new Date()) {
        alert("User still active");
        return;
      }
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
      loadUsers();
    },
    [token, loadRequests, loadUsers]
  );

  const deleteRequest = useCallback(
    async (id) => {
      if (!window.confirm("Delete this subscription request?")) return;
      await fetch(`${API}/subscription-requests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadRequests();
    },
    [token, loadRequests]
  );

  // ---------------- SLIPS ----------------
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slipId, gameIndex: index, result }),
      });
      loadSlips(page);
    },
    [token, loadSlips, page]
  );

  // ---------------- CREATE SLIP ----------------
  const addGameRow = () =>
    setGames([...games, { home: "", away: "", odd: "", type: "" }]);

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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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

  // ---------------- LOGOUT ----------------
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // ---------------- INIT ----------------
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      window.location.href = "/admin-login";
      return;
    }

    loadUsers();
    loadRequests();
    loadSlips(1);
    loadVisitors(); // ✅ NEW
  }, [loadUsers, loadRequests, loadSlips, loadVisitors]);

  // ---------------- UI ----------------
  return (
    <div className="section">
      <div className="header-row">
        <h2>Admin Dashboard</h2>
        <button className="btn btn-logout" onClick={logout}>
          Logout
        </button>
      </div>

      {/* ✅ VISITORS */}
      <div className="card">
        <h3>Visitors</h3>
        {visitors.map((v, i) => (
          <div key={i} className="game-row">
            <span>{v.ip}</span>
            <span>{new Date(v.visitedAt).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* USERS */}
      <div className="card">
        <h3>Users</h3>
        {users.map((u) => (
          <div key={u._id} className="game-row">
            <span>{u.email}</span>
            <span className={`plan-badge plan-${u.plan}`}>
              {u.plan.toUpperCase()}
            </span>
            <span>
              Expiry:{" "}
              {u.expiresAt
                ? new Date(u.expiresAt).toDateString()
                : "No expiry"}
            </span>
            <button
              className="btn btn-logout"
              onClick={() => deleteUser(u._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* (rest unchanged...) */}
    </div>
  );
} 
