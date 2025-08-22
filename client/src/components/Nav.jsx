import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/auth";

export default function Nav(){
  const { user, logout } = useAuth();
  return (
    <nav className="bg-white p-4 shadow flex justify-between">
      <div className="flex gap-4">
        <Link to="/tickets" className="font-semibold">Tickets</Link>
        <Link to="/kb" className="font-semibold">KB</Link>
        <Link to="/settings" className="font-semibold">Settings</Link>
      </div>
      <div className="flex gap-4 items-center">
        <div>{user?.name || user?.email} ({user?.role})</div>
        <button onClick={logout} className="text-sm text-red-600">Logout</button>
      </div>
    </nav>
  );
}
