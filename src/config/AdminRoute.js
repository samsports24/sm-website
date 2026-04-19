/**
 * AdminRoute — Route guard for the Admin Panel.
 *
 * Checks for a valid adminToken in localStorage.
 * Redirects to /admin-login if not authenticated.
 */

import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default AdminRoute;
