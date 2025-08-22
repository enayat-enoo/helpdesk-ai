import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetchTickets();
    fetchAgents();
  }, []);

  async function fetchTickets() {
    try {
      const res = await api.get("/tickets");
      // only unassigned
      setTickets(res.data.filter(t => !t.assignedTo));
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchAgents() {
    try {
      const res = await api.get("/users?role=agent");
      setAgents(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function assignTicket(ticketId, agentId) {
    try {
      await api.put(`/tickets/${ticketId}/assign`, { agentId });
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Assign Tickets</h1>
      {tickets.length === 0 ? (
        <p>No unassigned tickets.</p>
      ) : (
        <ul className="space-y-3">
          {tickets.map((t) => (
            <li key={t._id} className="border p-3 rounded shadow">
              <p><b>{t.title}</b></p>
              <p className="text-sm text-gray-600">{t.description}</p>
              <select
                onChange={(e) => assignTicket(t._id, e.target.value)}
                defaultValue=""
                className="border rounded p-1 mt-2"
              >
                <option value="" disabled>Select agent</option>
                {agents.map((a) => (
                  <option key={a._id} value={a._id}>{a.email}</option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
