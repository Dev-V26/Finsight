import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../../api/auth.api";
import { useAuth } from "../../hooks/useAuth";
import { Card, CardContent } from "../../components/ui/Card";
import { Input, Label } from "../../components/ui/Inputs";
import Button from "../../components/ui/Button";

export default function Register() {
  const nav = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const res = await registerApi(form); // {success,message,data:{token,user}}
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      nav("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 border-r border-slate-800/70 bg-slate-950/30">
        <div>
          <p className="text-xs text-slate-400">FinSight</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-100 tracking-tight">
            Set goals. Stay on budget. See progress.
          </h1>
          <p className="mt-4 text-sm text-slate-400 max-w-md">
            Create your account to start tracking transactions, budgets, goals and your portfolio.
          </p>
        </div>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} FinSight</p>
      </div>

      <div className="flex items-center justify-center p-10">
        <Card className="w-full max-w-md">
          <CardContent>
            <h2 className="text-2xl font-semibold text-slate-100">Create account</h2>
            <p className="mt-1 text-sm text-slate-400">Start using FinSight in minutes.</p>

            {error ? (
              <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-rose-200 text-sm">
                {error}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  className="mt-2"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  required
                  minLength={2}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  className="mt-2"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <Label>Password</Label>
                <Input
                  className="mt-2"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full" loading={busy}>
                Register
              </Button>
            </form>

            <p className="mt-4 text-sm text-slate-400">
              Already have an account?{" "}
              <Link className="text-indigo-400 hover:underline" to="/login">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
