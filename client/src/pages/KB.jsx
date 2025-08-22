import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import api from "../utils/api";
import { useAuth } from "../utils/auth";

export default function KB(){
  const [articles,setArticles]=useState([]);
  const [title,setTitle]=useState("");
  const [body,setBody]=useState("");
  const { user } = useAuth();

  useEffect(()=> { fetch(); }, []);

  async function fetch() {
    const res = await api.get("/kb");
    setArticles(res.data);
  }

  async function create(){
    await api.post("/kb", { title, body, tags: [], status: "published" });
    setTitle(""); setBody("");
    fetch();
  }

  return (
    <>
      <Nav/>
      <div className="p-6">
        {user?.role === "admin" && (
          <div className="bg-white p-4 rounded shadow mb-6">
            <h3>Add Article</h3>
            <input className="w-full border p-2 mb-2" placeholder="title" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="w-full border p-2 mb-2" placeholder="body" value={body} onChange={e=>setBody(e.target.value)} />
            <button onClick={create} className="bg-blue-600 text-white p-2 rounded">Add</button>
          </div>
        )}
        <div>
          {articles.map(a => (
            <div key={a._id} className="bg-white p-3 rounded shadow mb-2">
              <div className="font-semibold">{a.title}</div>
              <div className="text-sm text-gray-600">{a.body}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
