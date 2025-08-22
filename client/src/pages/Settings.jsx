import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import api from "../utils/api";

export default function Settings(){
  const [cfg, setCfg] = useState(null);
  useEffect(()=> { load(); }, []);

  async function load(){
    const res = await api.get("/config");
    setCfg(res.data);
  }

  async function save(){
    await api.put("/config", cfg);
    alert("Saved");
  }

  if (!cfg) return <div>Loading...</div>;
  return (
    <>
      <Nav/>
      <div className="p-6">
        <div className="bg-white p-4 rounded shadow max-w-md">
          <h3>Config</h3>
          <div className="mb-2">
            <label className="block">Auto Close</label>
            <input type="checkbox" checked={cfg.autoCloseEnabled} onChange={e => setCfg({...cfg, autoCloseEnabled: e.target.checked})} />
          </div>
          <div className="mb-2">
            <label>Confidence Threshold</label>
            <input type="number" step="0.01" min="0" max="1" value={cfg.confidenceThreshold} onChange={e => setCfg({...cfg, confidenceThreshold: parseFloat(e.target.value)})} className="border p-1" />
          </div>
          <div>
            <button onClick={save} className="bg-blue-600 text-white p-2 rounded">Save</button>
          </div>
        </div>
      </div>
    </>
  );
}
