"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Notification = {
  id: number;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
};

export default function Notifications({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) { console.error(error); }
    else { setNotifications(data || []); }
    setLoading(false);
  };

  const markAsRead = async (id: number) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = async () => {
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = async () => {
    await supabase.from("notifications").delete().eq("user_id", userId);
    setNotifications([]);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read first
    if (!notification.read) await markAsRead(notification.id);

    // Navigate based on type
    switch (notification.type) {
      case "new_job":
        router.push("/dashboard");
        break;
      case "interest":
        router.push("/client-dashboard");
        break;
      case "hired":
        router.push("/dashboard");
        break;
      case "completed":
        router.push("/dashboard");
        break;
      case "rated":
        router.push("/dashboard");
        break;
      case "workspace":
        router.push("/client-dashboard");
        break;
      default:
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "new_job": return "📋";
      case "interest": return "👋";
      case "hired": return "🎉";
      case "completed": return "✅";
      case "rated": return "⭐";
      case "workspace": return "🚀";
      default: return "🔔";
    }
  };

  const getActionText = (type: string) => {
    switch (type) {
      case "new_job": return "View Jobs →";
      case "interest": return "View Requests →";
      case "hired": return "Open Dashboard →";
      case "completed": return "View Jobs →";
      case "workspace": return "View Requests →";
      default: return "View →";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayed = showAll ? notifications : notifications.slice(0, 5);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <h3 className="text-white font-bold">🔔 Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">
              {unreadCount} new
            </span>
          )}
          <span className="text-gray-500 text-xs ml-auto">
            {collapsed ? "▶ Show" : "▼ Hide"}
          </span>
        </button>

        {!collapsed && notifications.length > 0 && (
          <div className="flex items-center gap-3 ml-4">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-gray-500 hover:text-yellow-400 transition-all">
                Mark all read
              </button>
            )}
            <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-400 transition-all">
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* CONTENT */}
      {!collapsed && (
        <div className="mt-2">
          {loading && <p className="text-gray-500 text-sm text-center">Loading notifications...</p>}

          {!loading && notifications.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">No notifications yet.</p>
          )}

          <div className="flex flex-col gap-2">
            {displayed.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01] ${
                  notification.read
                    ? "bg-gray-950 border border-gray-800 hover:border-gray-700"
                    : "bg-yellow-500 bg-opacity-10 border border-yellow-500 hover:bg-opacity-20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{getIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${notification.read ? "text-gray-400" : "text-white"}`}>
                      {notification.title}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{notification.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-gray-600 text-xs">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                      <span className="text-yellow-400 text-xs font-bold">
                        {getActionText(notification.type)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.read && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    )}
                    <button
                      onClick={(e) => deleteNotification(notification.id, e)}
                      className="text-gray-600 hover:text-red-400 transition-all text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {notifications.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-4 text-xs text-gray-500 hover:text-yellow-400 transition-all py-2"
            >
              {showAll ? "Show less" : `Show all ${notifications.length} notifications`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}