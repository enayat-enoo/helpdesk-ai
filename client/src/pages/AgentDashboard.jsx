import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function AgentDashboard() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      const res = await api.get("/tickets/assigned/me");
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function updateStatus(id, status) {
    await api.put(`/tickets/${id}/status`, { status });
    fetchTickets();
  }

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">My Assigned Tickets</h2>
      {tickets.length === 0 ? (
        <p>No tickets assigned to you.</p>
      ) : (
        <ul className="space-y-3">
          {tickets.map((t) => (
            <li key={t._id} className="border p-3 rounded shadow">
              <p><b>{t.title}</b></p>
              <p className="text-sm text-gray-600">{t.status}</p>
              <div className="space-x-2 mt-2">
                <button 
                  onClick={() => updateStatus(t._id, "in-progress")}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  In Progress
                </button>
                <button 
                  onClick={() => updateStatus(t._id, "resolved")}
                  className="bg-green-600 text-white px-2 py-1 rounded"
                >
                  Resolve
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
