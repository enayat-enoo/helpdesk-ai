import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./utils/auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import KB from "./pages/KB";
import Settings from "./pages/Settings";
import "./index.css";
import AgentDashboard from "./pages/AgentDashboard";
import AdminTickets from "./pages/AdminTickets";

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            user.role === "admin" ? (
              <Navigate to="/kb" /> // default landing for admin
            ) : user.role === "agent" ? (
              <AgentDashboard /> // agent dashboard
            ) : (
              <Tickets /> // normal user tickets
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/admin/tickets"
        element={
          user?.role === "admin" ? <AdminTickets /> : <Navigate to="/" />
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/tickets"
        element={user ? <Tickets /> : <Navigate to="/login" />}
      />
      <Route
        path="/tickets/:id"
        element={user ? <TicketDetail /> : <Navigate to="/login" />}
      />
      <Route
        path="/kb"
        element={user?.role === "admin" ? <KB /> : <Navigate to="/" />}
      />

      <Route
        path="/settings"
        element={user?.role === "admin" ? <Settings /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
