// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import LoadingButton from "../../components/ui/LoadingButton";
import { Card, CardContent } from "../../components/ui/Card";
import { Input, Label } from "../../components/ui/Inputs";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ IMPORTANT: pass object
      await login({ email: email.trim(), password });
      toast.success("Logged in successfully!");
      nav("/dashboard");
    } catch (err) {
      toast.error(err?.normalizedMessage || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 border-r border-slate-800/70 bg-slate-950/30">
        <div>
          <p className="text-xs text-slate-400">FinSight</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-100 tracking-tight">
            Track spending. Build habits. Grow wealth.
          </h1>
          <p className="mt-4 text-sm text-slate-400 max-w-md">
            A clean, fast personal finance dashboard for transactions, budgets, goals and portfolio.
          </p>
        </div>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} FinSight</p>
      </div>

      <div className="flex items-center justify-center p-10">
        <Card className="w-full max-w-md">
          <CardContent>
            <h2 className="text-2xl font-semibold text-slate-100">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-400">Log in to continue.</p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="mt-2"
                />
              </div>

              <LoadingButton type="submit" loading={loading} className="bg-indigo-600 text-white w-full">
                Login
              </LoadingButton>
            </form>

            <p className="mt-4 text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300">
                Register here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
