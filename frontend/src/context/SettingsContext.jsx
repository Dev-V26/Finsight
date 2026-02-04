import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSettingsApi, updateSettingsApi } from "../api/settings.api";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const envelope = await getSettingsApi(); // { success, message, data }
      const normalized = envelope?.data || null;
      setSettings(normalized);
    } catch (e) {
      console.error("Settings refresh failed:", e);
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  const save = async (partial) => {
    const payload = {
      preferences: partial?.preferences,
      notifications: partial?.notifications,
    };
    const envelope = await updateSettingsApi(payload);
    const normalized = envelope?.data || null;
    setSettings(normalized);
    return normalized;
  };

  useEffect(() => {
    // refresh once on app mount; token interceptor will handle auth
    refresh();
  }, []);

  const value = useMemo(() => ({ settings, loading, refresh, save }), [settings, loading]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
