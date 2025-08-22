import React, { useEffect, useState } from "react";
import api from "../utils/api";
import Nav from "../components/Nav";
import { Link } from "react-router-dom";

export default function Tickets(){
  const [tickets, setTickets] = useState([]);
  const [title,setTitle]=useState("");
  const [desc,setDesc]=useState("");

  useEffect(()=> { fetchTickets(); }, []);

  async function fetchTickets(){
    try {
      const res = await api.get("/tickets"); // proxy ensures auth header set in auth context
      setTickets(res.data);
    } catch (err) {
      console.error(err);
      setTickets([]);
    }
  }

  async function createTicket(e){
    e.preventDefault();
    await api.post("/tickets", { title, description: desc });
    setTitle(""); setDesc("");
    fetchTickets();
  }

  return (
    <>
      <Nav/>
      <div className="p-6">
        <div className="max-w-xl">
          <form onSubmit={createTicket} className="bg-white p-4 rounded shadow mb-6">
            <h3 className="text-lg">Create ticket</h3>
            <input className="w-full border p-2 mb-2" placeholder="title" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="w-full border p-2 mb-2" placeholder="description" value={desc} onChange={e=>setDesc(e.target.value)} />
            <button className="bg-blue-600 text-white p-2 rounded">Create</button>
          </form>
        </div>

        <div>
          <h3 className="text-xl mb-2">Tickets</h3>
          <div className="space-y-2">
            {tickets.map(t => (
              <div key={t._id} className="bg-white p-3 rounded shadow flex justify-between">
                <div>
                  <Link to={`/tickets/${t._id}`} className="font-semibold">{t.title}</Link>
                  <div className="text-sm text-gray-600">{t.status} • {new Date(t.createdAt).toLocaleString()}</div>
                </div>
                <div>{t.category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
