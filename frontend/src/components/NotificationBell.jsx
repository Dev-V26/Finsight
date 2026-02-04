import { useEffect, useRef, useState } from "react";
import { getNotifications, getUnreadCount, markAllRead, markNotificationRead } from "../api/notifications.api";

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    function listener(event) {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    }
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useOnClickOutside(wrapperRef, () => setOpen(false));

  async function refreshUnread() {
    try {
      const c = await getUnreadCount();
      setUnread(c);
    } catch (e) {
      console.error("Unread count failed:", e);
    }
  }

  async function refreshList() {
    setLoading(true);
    try {
      const list = await getNotifications(8);
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Fetch notifications failed:", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUnread();
    const t = setInterval(refreshUnread, 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (open) refreshList();
  }, [open]);

  async function onMarkRead(id) {
    try {
      await markNotificationRead(id);
      await refreshUnread();
      await refreshList();
    } catch (e) {
      console.error("Mark read failed:", e);
    }
  }

  async function onMarkAllRead() {
    try {
      await markAllRead();
      await refreshUnread();
      await refreshList();
    } catch (e) {
      console.error("Mark all read failed:", e);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 flex items-center justify-center transition"
        title="Notifications"
      >
        <span className="text-lg">🔔</span>

        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[90vw] rounded-2xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <p className="font-semibold">Notifications</p>

            <button
              onClick={onMarkAllRead}
              className="text-sm text-slate-300 hover:text-white underline underline-offset-2"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[420px] overflow-auto">
            {loading ? (
              <div className="p-4 text-slate-400 text-sm">Loading...</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-slate-400 text-sm">
                No notifications yet.
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  onClick={() => !n.read && onMarkRead(n._id)}
                  className={`w-full text-left p-4 border-b border-slate-900 hover:bg-slate-900 transition ${
                    n.read ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-slate-100 font-medium truncate">
                        {n.title}
                      </p>
                      <p className="text-slate-300 text-sm mt-1 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-slate-500 text-xs mt-2">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {!n.read && (
                      <span className="mt-1 w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
