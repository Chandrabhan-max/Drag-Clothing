import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  // 1. Wait for AuthContext to finish checking the token
  if (loading) {
    return <div className="flex h-screen items-center justify-center font-bold text-gray-500 uppercase tracking-widest text-xs">Loading Secure Data...</div>;
  }

  // 2. Not logged in? Kick to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Doesn't have the right role? Send them to their correct dashboard
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'super_admin') return <Navigate to="/superadmin" replace />;
    if (user.role === 'client') return <Navigate to="/client" replace />;
    if (user.role === 'manager') return <Navigate to="/manager" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;