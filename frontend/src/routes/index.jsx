import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import Dashboard from "../pages/dashboard/Dashboard.jsx";
import Budgets from "../pages/budgets/Budgets.jsx";
import Goals from "../pages/goals/Goals.jsx";
import Transactions from "../pages/transactions/Transactions.jsx";
import Settings from "../pages/settings/Settings.jsx";
import Portfolio from "../pages/portfolio/Portfolio.jsx";
import Reports from "../pages/reports/Reports";



export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
