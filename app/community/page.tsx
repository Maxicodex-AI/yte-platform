"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Message = {
  id: number;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  sender_photo: string;
  message: string;
  channel: string;
  created_at: string;
};

const CHANNELS = [
  { id: "global", label: "🌍 Global", desc: "Everyone", color: "border-yellow-500", roles: ["client", "technician", "engineer"] },
  { id: "engineers", label: "👷 Engineers", desc: "Certified Engineers Only", color: "border-purple-500", roles: ["engineer"] },
  { id: "technicians", label: "🛠️ Technicians", desc: "Technicians Only", color: "border-blue-500", roles: ["technician"] },
  { id: "projects", label: "🚀 Projects", desc: "Project Collaboration", color: "border-green-500", roles: ["engineer", "technician"] },
];

export default function CommunityChat() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeChannel, setActiveChannel] = useState("global");
  const [sending, setSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  if (!isLoaded || !user) return;

  fetchMessages();
  setOnlineCount(Math.floor(Math.random() * 50) + 10);

  const channel = supabase
    .channel(`community-${activeChannel}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "community_messages",
        filter: `channel=eq.${activeChannel}`,
      },
      (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
        scrollToBottom();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [isLoaded, user, activeChannel]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("community_messages")
      .select("*")
      .eq("channel", activeChannel)
      .order("created_at", { ascending: true })
      .limit(100);
    setMessages(data || []);
  };

  const canAccessChannel = (channelId: string) => {
    const channel = CHANNELS.find(c => c.id === channelId);
    if (!channel) return false;
    if (channelId === "global") return true;
    const role = user?.unsafeMetadata?.role as string;
    return channel.roles.includes(role);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return;
    if (!canAccessChannel(activeChannel)) return;

    setSending(true);
    const role = user.unsafeMetadata?.role as string || "client";

    await supabase.from("community_messages").insert({
      sender_id: user.id,
      sender_name: user.fullName || "Anonymous",
      sender_role: role,
      sender_photo: user.imageUrl || "",
      message: newMessage.trim(),
      channel: activeChannel,
    });

    setNewMessage("");
    setSending(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "engineer": return { label: "Engineer", color: "bg-purple-500" };
      case "technician": return { label: "Technician", color: "bg-blue-500" };
      case "client": return { label: "Client", color: "bg-yellow-500 text-black" };
      default: return { label: role, color: "bg-gray-500" };
    }
  };

  const activeChannelData = CHANNELS.find(c => c.id === activeChannel);
  const userRole = user?.unsafeMetadata?.role as string;

  if (!isLoaded) {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-yellow-400 animate-pulse">
        ⚡ Loading Community...
      </p>
    </main>
  );
}

// Wait for Clerk to redirect unauthenticated users
if (!user) {
  return null;
}

return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* TOP NAV */}
      <nav className="bg-black border-b-2 border-yellow-500 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-yellow-400 text-xl"
          >
            ☰
          </button>
          <a href="/">
            <img src="/images/yte-icon.png" alt="YTE" className="h-10 w-auto" />
          </a>
          <div>
            <p className="text-white font-bold text-sm">YTE Community</p>
            <p className="text-green-400 text-xs">🟢 {onlineCount} online</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold capitalize">
            {userRole || "member"}
          </span>
          <button
            onClick={() => window.history.back()}
            className="text-gray-400 hover:text-yellow-400 text-sm"
          >
            ← Back
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>

        {/* SIDEBAR */}
        <aside className={`${sidebarOpen ? "flex" : "hidden"} md:flex flex-col w-64 bg-black border-r border-gray-800 absolute md:relative z-40 h-full`}>

          {/* CHANNELS */}
          <div className="p-4 border-b border-gray-800">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Channels</p>
            <div className="flex flex-col gap-1">
              {CHANNELS.map((ch) => {
                const canAccess = ch.id === "global" || ch.roles.includes(userRole);
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      if (canAccess) {
                        setActiveChannel(ch.id);
                        setSidebarOpen(false);
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${
                      activeChannel === ch.id
                        ? "bg-yellow-500 text-black"
                        : canAccess
                        ? "text-gray-400 hover:bg-gray-900 hover:text-white"
                        : "text-gray-700 cursor-not-allowed"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${ch.color.replace("border-", "bg-")}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{ch.label}</p>
                      <p className={`text-xs ${activeChannel === ch.id ? "text-black" : "text-gray-600"}`}>
                        {ch.desc}
                      </p>
                    </div>
                    {!canAccess && <span className="text-xs">🔒</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* COMMUNITY INFO */}
          <div className="p-4 flex-1">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">About</p>
            <div className="bg-gray-900 rounded-xl p-4">
              <p className="text-white font-bold text-sm mb-2">🌍 YTE Community</p>
              <p className="text-gray-400 text-xs mb-3">
                A professional space where engineers and technicians collaborate, share ideas, and execute projects together.
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Members</span>
                  <span className="text-white font-bold">{onlineCount + 120}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Online Now</span>
                  <span className="text-green-400 font-bold">🟢 {onlineCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* USER PROFILE */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={user?.imageUrl || ""}
                  alt="Profile"
                  className="w-9 h-9 rounded-full border-2 border-yellow-500"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{user?.fullName || "You"}</p>
                <p className="text-green-400 text-xs">● Online</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CHAT AREA */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* CHANNEL HEADER */}
          <div className={`bg-gray-900 border-b border-gray-800 px-4 py-3 flex justify-between items-center`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${activeChannelData?.color.replace("border-", "bg-")}`} />
              <div>
                <p className="text-white font-bold">{activeChannelData?.label}</p>
                <p className="text-gray-500 text-xs">{activeChannelData?.desc} • {messages.length} messages</p>
              </div>
            </div>
            {!canAccessChannel(activeChannel) && (
              <span className="text-xs bg-red-500 text-white px-3 py-1 rounded-full">🔒 Restricted</span>
            )}
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <p className="text-5xl">💬</p>
                <p className="text-white font-bold text-lg">No messages yet</p>
                <p className="text-gray-500 text-sm text-center">
                  Be the first to start a conversation in {activeChannelData?.label}!
                </p>
              </div>
            )}

            {messages.map((msg, i) => {
              const isMe = msg.sender_id === user?.id;
              const showAvatar = i === 0 || messages[i - 1]?.sender_id !== msg.sender_id;
              const badge = getRoleBadge(msg.sender_role);

              return (
                <div key={i} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  {/* AVATAR */}
                  <div className="flex-shrink-0 w-9">
                    {showAvatar && (
                      msg.sender_photo ? (
                        <img
                          src={msg.sender_photo}
                          alt={msg.sender_name}
                          className="w-9 h-9 rounded-full border-2 border-yellow-500 object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full border-2 border-yellow-500 bg-gray-800 flex items-center justify-center text-yellow-400 font-bold text-sm">
                          {(msg.sender_name || "?")[0].toUpperCase()}
                        </div>
                      )
                    )}
                  </div>

                  {/* MESSAGE BUBBLE */}
                  <div className={`flex flex-col max-w-xs md:max-w-lg ${isMe ? "items-end" : "items-start"}`}>
                    {showAvatar && (
                      <div className={`flex items-center gap-2 mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        <p className="text-white font-bold text-xs">{isMe ? "You" : msg.sender_name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold text-white ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-3 shadow-lg ${
                      isMe
                        ? "bg-yellow-500 text-black rounded-tr-sm"
                        : "bg-gray-800 text-white rounded-tl-sm"
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isMe ? "text-black text-opacity-60 text-right" : "text-gray-500"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {isMe && " ✓✓"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          {canAccessChannel(activeChannel) ? (
            <div className="bg-gray-900 border-t border-gray-800 p-4">
              <div className="flex gap-3 items-end">
                <img
  src={user.imageUrl}
  alt="You"
  className="w-9 h-9 rounded-full border-2 border-yellow-500 flex-shrink-0"
/>
                <div className="flex-1 flex gap-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={`Message ${activeChannelData?.label}...`}
                    className="flex-1 bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none text-sm resize-none"
                    rows={1}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-bold w-12 h-12 rounded-full transition-all flex items-center justify-center flex-shrink-0"
                  >
                    {sending ? "..." : "➤"}
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-xs mt-2 ml-12">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          ) : (
            <div className="bg-gray-900 border-t border-gray-800 p-4 text-center">
              <p className="text-gray-500 text-sm">
                🔒 This channel is restricted to {activeChannelData?.desc} only.
              </p>
              <p className="text-gray-600 text-xs mt-1">
                Your role: <span className="text-yellow-400 capitalize">{userRole}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}