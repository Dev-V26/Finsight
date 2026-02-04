// src/pages/settings/Settings.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "../../api/client";
import LoadingButton from "../../components/ui/LoadingButton";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import AppPageHeader from "../../components/layout/AppPageHeader";

/**
 * Settings Page (Combined)
 * - Profile preview (name/email) using /me
 * - Preferences using /settings (GET/PUT)
 *
 * Defensive: supports different backend response shapes.
 */

const CURRENCY_OPTIONS = [
  { code: "INR", label: "Indian Rupee (₹) - INR" },
  { code: "USD", label: "US Dollar ($) - USD" },
  { code: "EUR", label: "Euro (€) - EUR" },
  { code: "GBP", label: "British Pound (£) - GBP" },
  { code: "CAD", label: "Canadian Dollar (C$) - CAD" },
  { code: "AUD", label: "Australian Dollar (A$) - AUD" },
];

const TIMEZONE_OPTIONS = [
  { value: "auto", label: "Auto-detect (recommended)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
  { value: "Europe/London", label: "Europe/London" },
];

function pickSettings(data) {
  const s = data?.settings || data?.data?.settings || data?.data || data;
  return s && typeof s === "object" ? s : {};
}

function pickUser(data) {
  return data?.user || data?.data?.user || data?.data || data;
}

function getAutoTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
  } catch {
    return "Asia/Kolkata";
  }
}

export default function Settings() {
  const { loading, run } = useAsyncAction();

  const [loadingPage, setLoadingPage] = useState(true);

  // Profile preview
  const [profile, setProfile] = useState({ name: "", email: "" });

  // Preferences
  const [currency, setCurrency] = useState("INR");

  const [prefBudgetAlerts, setPrefBudgetAlerts] = useState(true);
  const [prefGoalReminders, setPrefGoalReminders] = useState(true);

  // Quiet hours
  const [quietEnabled, setQuietEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");

  // Timezone
  const [timezoneMode, setTimezoneMode] = useState("auto"); // auto | manual
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const effectiveTimezone = useMemo(() => {
    return timezoneMode === "auto" ? getAutoTimezone() : timezone;
  }, [timezoneMode, timezone]);

  const loadAll = async () => {
    setLoadingPage(true);
    try {
      // 1) profile
      try {
        const meRes = await api.get("/me");
        const user = pickUser(meRes.data);
        setProfile({
          name: user?.name || "",
          email: user?.email || "",
        });
      } catch {
        // fallback if backend uses /auth/me
        try {
          const meRes2 = await api.get("/auth/me");
          const user = pickUser(meRes2.data);
          setProfile({
            name: user?.name || "",
            email: user?.email || "",
          });
        } catch {
          setProfile({ name: "", email: "" });
        }
      }

      // 2) settings
      const sRes = await api.get("/settings");
      const s = pickSettings(sRes.data);

      setCurrency(s?.currency || s?.preferences?.currency || "INR");

      setPrefBudgetAlerts(
        s?.notifications?.budgetAlerts ??
          s?.budgetAlertsEnabled ??
          s?.preferences?.budgetAlertsEnabled ??
          true
      );
      setPrefGoalReminders(
        s?.notifications?.goalReminders ??
          s?.goalRemindersEnabled ??
          s?.preferences?.goalRemindersEnabled ??
          true
      );

      const quiet = s?.notifications?.quietHours || s?.quietHours || {};
      setQuietEnabled(
        quiet?.enabled ??
          s?.quietHoursEnabled ??
          s?.notifications?.quietHoursEnabled ??
          false
      );
      setQuietStart(quiet?.start || s?.quietStart || "22:00");
      setQuietEnd(quiet?.end || s?.quietEnd || "07:00");

      const tz = s?.timezone || s?.preferences?.timezone;
      if (!tz || tz === "auto") {
        setTimezoneMode("auto");
        setTimezone(getAutoTimezone());
      } else {
        setTimezoneMode("manual");
        setTimezone(tz);
      }
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Failed to load settings"
      );
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateQuietHours = () => {
    const re = /^\d{2}:\d{2}$/;
    if (!re.test(quietStart) || !re.test(quietEnd)) return false;
    return true;
  };

  const onSave = async (e) => {
    e.preventDefault();

    if (quietEnabled && !validateQuietHours()) {
      toast.error("Quiet hours time format should be HH:mm (e.g., 22:00).");
      return;
    }

    await run(async () => {
      const payload = {
        currency,
        timezone: timezoneMode === "auto" ? "auto" : timezone,
        notifications: {
          budgetAlerts: !!prefBudgetAlerts,
          goalReminders: !!prefGoalReminders,
          quietHours: {
            enabled: !!quietEnabled,
            start: quietStart,
            end: quietEnd,
          },
        },
      };

      await api.put("/settings", payload);
      toast.success("Settings saved");
    });
  };

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Settings"
        subtitle="Manage currency, notifications and timezone preferences."
      />

      <div className="grid gap-6">
        {/* Profile */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="mt-1 text-sm text-slate-400">
            This is a preview of your account details.
          </p>

          {loadingPage ? (
            <div className="mt-6 text-slate-400">Loading...</div>
          ) : (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400">Name</div>
                <div className="mt-1 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                  {profile.name || <span className="text-slate-500">—</span>}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Email</div>
                <div className="mt-1 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                  {profile.email || <span className="text-slate-500">—</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold">Preferences</h2>
          <p className="mt-1 text-sm text-slate-400">
            Customize how FinSight displays money and sends reminders.
          </p>

          {loadingPage ? (
            <div className="mt-6 text-slate-400">Loading...</div>
          ) : (
            <form onSubmit={onSave} className="mt-5 grid gap-6">
              {/* Currency */}
              <div>
                <label className="text-sm text-slate-300">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-400">
                  This will be used for displaying amounts across the app.
                </p>
              </div>

              {/* Timezone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300">
                    Timezone Mode
                  </label>
                  <select
                    value={timezoneMode}
                    onChange={(e) => setTimezoneMode(e.target.value)}
                    disabled={loading}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-300">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    disabled={loading || timezoneMode !== "manual"}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 disabled:opacity-60"
                  >
                    {TIMEZONE_OPTIONS.filter((t) => t.value !== "auto").map(
                      (t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      )
                    )}
                  </select>
                  <p className="mt-1 text-xs text-slate-400">
                    Effective timezone:{" "}
                    <span className="text-slate-200">{effectiveTimezone}</span>
                  </p>
                </div>
              </div>

              {/* Notifications */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold">Notifications</div>
                    <div className="mt-1 text-sm text-slate-400">
                      Control budget alerts, goal reminders and quiet hours.
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4">
                  <ToggleRow
                    label="Budget Alerts"
                    description="Notify when you reach budget thresholds."
                    checked={prefBudgetAlerts}
                    onChange={setPrefBudgetAlerts}
                    disabled={loading}
                  />

                  <ToggleRow
                    label="Goal Reminders"
                    description="Notify before deadlines and when goals become overdue."
                    checked={prefGoalReminders}
                    onChange={setPrefGoalReminders}
                    disabled={loading}
                  />

                  <div className="mt-2 border-t border-slate-800 pt-4">
                    <ToggleRow
                      label="Quiet Hours"
                      description="Silence notifications during a time range."
                      checked={quietEnabled}
                      onChange={setQuietEnabled}
                      disabled={loading}
                    />

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-300">Start</label>
                        <input
                          value={quietStart}
                          onChange={(e) => setQuietStart(e.target.value)}
                          disabled={loading || !quietEnabled}
                          placeholder="22:00"
                          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 disabled:opacity-60"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-slate-300">End</label>
                        <input
                          value={quietEnd}
                          onChange={(e) => setQuietEnd(e.target.value)}
                          disabled={loading || !quietEnabled}
                          placeholder="07:00"
                          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Quiet hours are checked using your selected timezone.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={loadAll}
                  disabled={loading}
                  className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 hover:bg-slate-800 transition disabled:opacity-60"
                >
                  Reset
                </button>

                <LoadingButton
                  type="submit"
                  loading={loading}
                  className="bg-indigo-600 text-white"
                >
                  Save Changes
                </LoadingButton>
              </div>
            </form>
          )}
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold">Security</h2>
          <p className="text-slate-400 mt-1 text-sm">
            Password change can be added here when backend endpoint is ready.
          </p>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => toast("Coming soon")}
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 hover:bg-slate-800 transition"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange, disabled }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-semibold text-slate-200">{label}</div>
        <div className="mt-1 text-xs text-slate-400">{description}</div>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          "relative h-7 w-12 rounded-full border transition",
          checked
            ? "bg-indigo-600 border-indigo-500"
            : "bg-slate-900 border-slate-700",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
        aria-pressed={checked}
      >
        <span
          className={[
            "absolute top-0.5 h-6 w-6 rounded-full bg-white transition",
            checked ? "left-5" : "left-0.5",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
