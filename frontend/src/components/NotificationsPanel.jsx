import { useEffect, useState } from "react";
import { getNotifications, markNotificationRead, markAllRead } from "../api/notifications.api";

export default function NotificationsPanel({ limit = 3 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await getNotifications(limit);
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("NotificationsPanel error:", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">Notifications</h2>
          <p className="text-slate-400 text-sm mt-1">Budget and goal alerts appear here.</p>
        </div>

        <button
          onClick={async () => {
            await markAllRead();
            await refresh();
          }}
          className="rounded-xl border border-slate-700 px-4 py-2 hover:bg-slate-800 text-sm"
          title="Mark all read"
        >
          Mark all read
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-slate-400 text-sm">Loading notifications…</p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-slate-300 text-sm font-medium">No notifications yet</p>
            <p className="text-slate-400 text-xs mt-1">
              Once your budget crosses the alert threshold or a goal deadline is near/over, it will
              show up here.
            </p>
          </div>
        ) : (
          items.map((n) => (
            <button
              key={n._id}
              type="button"
              onClick={async () => {
                if (!n.read) await markNotificationRead(n._id);
                await refresh();
              }}
              className={`w-full text-left rounded-xl border border-slate-800 bg-slate-950 p-4 hover:bg-slate-900 transition ${
                n.read ? "opacity-80" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-slate-100 font-medium truncate">{n.title}</p>
                  <p className="text-slate-300 text-sm mt-1 line-clamp-2">{n.message}</p>
                  <p className="text-slate-500 text-xs mt-2">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read ? (
                  <span className="mt-1 w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
                ) : null}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
