"use client";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    fetchNotifications();

    // Real-time subscription
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error(error);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  const markAsRead = async (id: number) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "new_job": return "📋";
      case "interest": return "👋";
      case "hired": return "🎉";
      case "completed": return "✅";
      case "rated": return "⭐";
      default: return "🔔";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayed = showAll ? notifications : notifications.slice(0, 3);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-bold">🔔 Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-gray-500 hover:text-yellow-400 transition-all"
          >
            Mark all read
          </button>
        )}
      </div>

      {loading && (
        <p className="text-gray-500 text-sm text-center">Loading notifications...</p>
      )}

      {!loading && notifications.length === 0 && (
        <p className="text-gray-500 text-sm text-center">No notifications yet.</p>
      )}

      <div className="flex flex-col gap-2">
        {displayed.map((notification) => (
          <div
            key={notification.id}
            onClick={() => !notification.read && markAsRead(notification.id)}
            className={`p-3 rounded-xl cursor-pointer transition-all ${
              notification.read
                ? "bg-gray-950 border border-gray-800"
                : "bg-yellow-500 bg-opacity-10 border border-yellow-500"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">{getIcon(notification.type)}</span>
              <div className="flex-1">
                <p className={`text-sm font-bold ${notification.read ? "text-gray-400" : "text-white"}`}>
                  {notification.title}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">{notification.message}</p>
                <p className="text-gray-600 text-xs mt-1">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1" />
              )}
            </div>
          </div>
        ))}
      </div>

      {notifications.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 text-xs text-gray-500 hover:text-yellow-400 transition-all"
        >
          {showAll ? "Show less" : `Show all ${notifications.length} notifications`}
        </button>
      )}
    </div>
  );
}