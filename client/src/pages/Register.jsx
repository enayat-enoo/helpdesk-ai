import React, { useState } from "react";
import api from "../utils/api";
import { useAuth } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function Register(){
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const { login } = useAuth();
  const nav = useNavigate();
  const [err,setErr]=useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", { name, email, password });
      login(res.data);
      nav("/");
    } catch (err) {
      setErr(err?.response?.data?.error || "Register failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl mb-4">Register</h2>
        {err && <div className="text-red-600 mb-2">{err}</div>}
        <input className="w-full mb-2 border p-2" placeholder="name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full mb-2 border p-2" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full mb-2 border p-2" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-green-600 text-white p-2 rounded">Register</button>
      </form>
    </div>
  );
}
