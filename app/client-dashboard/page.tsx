"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { notify } from "@/lib/notify";
import MyRequests from "./MyRequests";
import Notifications from "../Notifications";

function WorkspaceMessages({ userId }: { userId: string }) {
  const [workspaces, setWorkspaces] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("workspaces")
      .select("*")
      .or(`client_id.eq.${userId},provider_id.eq.${userId}`)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .then(({ data }) => setWorkspaces(data || []));
  }, [userId]);

  if (workspaces.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
        <p className="text-4xl mb-3">💬</p>
        <p className="text-white font-bold mb-2">No Messages Yet</p>
        <p className="text-gray-500 text-sm">Messages appear here when you hire a provider.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h3 className="text-white font-bold mb-4">💬 Project Messages</h3>
      <div className="flex flex-col gap-3">
        {workspaces.map((ws, i) => (
          <a key={i} href={`/workspace/${ws.job_id}`}
            className="flex items-center gap-4 p-4 bg-gray-950 rounded-xl hover:bg-gray-800 transition-all">
            <div className="w-12 h-12 bg-yellow-500 bg-opacity-20 rounded-full flex items-center justify-center text-xl flex-shrink-0">
              🔧
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">{ws.problem}</p>
              <p className="text-gray-500 text-xs">Engineer: {ws.provider_name}</p>
              <p className="text-yellow-400 text-xs mt-1">Open workspace →</p>
            </div>
            <span className="text-xs bg-green-500 text-black px-2 py-1 rounded-full font-bold flex-shrink-0">Active</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [problem, setProblem] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("standard");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("home");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [stats, setStats] = useState({ active: 0, completed: 0, pending: 0, total: 0 });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setError("");
    if (isLoaded && user) {
      setFullName(user.fullName || "");
      const meta = user.unsafeMetadata;
      setPhone((meta?.phone as string) || "");

      supabase
        .from("job_requests")
        .select("*")
        .eq("client_id", user.id)
        .order("client_id", { ascending: false })
        .then(({ data }) => {
          const active = data?.filter(j => j.status === "in_progress").length || 0;
          const completed = data?.filter(j => j.status === "completed").length || 0;
          const pending = data?.filter(j => j.status === "pending").length || 0;
          const total = data?.length || 0;
          setStats({ active, completed, pending, total });
          setRecentRequests((data || []).slice(0, 5));
        });
    }
  }, [isLoaded, user]);

  if (!isLoaded) return null;
  if (!user) { router.push("/"); return null; }

  const role = user.unsafeMetadata?.role as string | undefined;
  if (role !== "client") {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
        <p className="text-gray-400 mb-4">This dashboard is for Clients only.</p>
        <a href="/" className="text-yellow-400 hover:underline">← Back to Home</a>
      </main>
    );
  }

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await user.update({
        firstName: fullName.split(" ")[0],
        lastName: fullName.split(" ").slice(1).join(" "),
        unsafeMetadata: { ...user.unsafeMetadata, phone },
      });
      setProfileSaved(true);
      setActiveTab("home");
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setSavingProfile(false);
    }
  };

  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve({ lat: 0, lng: 0 }); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: 0, lng: 0 })
      );
    });
  };

const submitRequest = async () => {
  if (!problem.trim() || !location.trim()) {
    setError("Please fill in both the problem and location fields.");
    return;
  }

  if (submitting || submitted) return; // Prevent double submit
  setSubmitting(true);
  setError("");

  const { data: existing } = await supabase
    .from("job_requests")
    .select("id")
    .eq("client_id", user.id)
    .eq("status", "pending")
    .ilike("problem", problem.trim());

  if (existing && existing.length > 0) {
    setError("You already have a similar pending request.");
    setSubmitting(false);
    return;
  }

  const coords = await getLocation();

  const { error: dbError } = await supabase.from("job_requests").insert({
    client_id: user.id,
    client_name: user.fullName || fullName || "Client",
    problem,
    location,
    urgency,
    status: "pending",
    job_type: jobType,
    client_latitude: coords.lat,
    client_longitude: coords.lng,
  });

  if (dbError) {
    setError("Failed to submit request. Please try again.");
    setSubmitting(false);
    return;
  }

  const { data: availableProviders } = await supabase
    .from("providers")
    .select("clerk_id, role")
    .eq("available", true);

  if (availableProviders) {
    for (const provider of availableProviders) {
      if (jobType === "contract" && provider.role !== "engineer") continue;
      await notify(
        provider.clerk_id,
        "📋 New Job Posted!",
        `A client needs help with: "${problem}" in ${location}`,
        "new_job"
      );
    }
  }

  setSubmitted(true);
  setSubmitting(false);
  setRefreshKey(prev => prev + 1);
  setActiveTab("requests");
  setStats(prev => ({ ...prev, pending: prev.pending + 1, total: prev.total + 1 }));
  setTimeout(() => {
    setSubmitted(false);
    setProblem("");
    setLocation("");
    setUrgency("normal");
    setJobType("standard");
  }, 2500);
};

  const firstName = fullName.split(" ")[0] || "Client";

 const navItems = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "post", icon: "➕", label: "Post Job" },
  { id: "requests", icon: "📋", label: "Requests" },
  { id: "messages", icon: "💬", label: "Messages" },
  { id: "community", icon: "🌐", label: "Community" },
  { id: "profile", icon: "👤", label: "Profile" },
];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* SIDEBAR - Desktop Only */}
      <aside className="hidden md:flex flex-col w-64 bg-black border-r border-gray-800 min-h-screen fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-gray-800">
          <a href="/"><img src="/images/yte-icon.png" alt="YTE" className="h-12 w-auto" /></a>
        </div>

        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img src={user.imageUrl} alt="Profile" className="w-10 h-10 rounded-full border-2 border-yellow-500 object-cover" />
            <div>
              <p className="text-white font-bold text-sm">{fullName || "Client"}</p>
              <p className="text-gray-500 text-xs">Client Account</p>
              <span className="text-xs text-green-400">✅ Verified Client</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="flex flex-col gap-1">
            {[
              { id: "home", icon: "🏠", label: "Dashboard", badge: 0 },
              { id: "post", icon: "➕", label: "Post a Job", badge: 0 },
              { id: "requests", icon: "📋", label: "My Requests", badge: stats.pending },
              { id: "messages", icon: "💬", label: "Messages", badge: stats.active },
              { id: "community", icon: "🌐", label: "Community", badge: 0 },
              { id: "notifications", icon: "🔔", label: "Notifications", badge: 0 },
              { id: "profile", icon: "👤", label: "Settings", badge: 0 },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left ${
                  activeTab === item.id ? "bg-yellow-500 text-black font-bold" : "text-gray-400 hover:bg-gray-900 hover:text-white"
                }`}>
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    activeTab === item.id ? "bg-black text-yellow-400" : "bg-yellow-500 text-black"
                  }`}>{item.badge}</span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* UPGRADE BANNER */}
        <div className="p-4">
          <div className="bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-2xl p-4 text-center mb-4">
            <p className="text-black text-lg mb-1">👑</p>
            <p className="text-black font-extrabold text-sm">Upgrade to Pro</p>
            <p className="text-black text-xs mb-3">Get priority support and advanced features</p>
            <button className="w-full bg-black text-yellow-400 font-bold py-2 rounded-xl text-xs">
              Upgrade Now
            </button>
          </div>
          <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-900 hover:text-white transition-all text-sm">
            <span>🚪</span><span>Back to Home</span>
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-64 pb-20 md:pb-0">

        {/* TOP BAR */}
        <header className="bg-black border-b border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
          <div>
            <h1 className="text-white font-bold text-lg">
              {activeTab === "home" && `Welcome back, ${firstName}! 👋`}
              {activeTab === "post" && "Post a Job"}
              {activeTab === "requests" && "My Requests"}
              {activeTab === "messages" && "Messages"}
              {activeTab === "community" && "YTE Community"}
              {activeTab === "notifications" && "Notifications"}
              {activeTab === "profile" && "Settings"}
            </h1>
            <p className="text-gray-500 text-xs">
              {activeTab === "home" && "Let's get your projects done."}
              {activeTab === "post" && "Describe your engineering problem"}
              {activeTab === "requests" && `${stats.total} total requests`}
              {activeTab === "messages" && "Your project conversations"}
              {activeTab === "community" && "Connect with engineers and clients"}
              {activeTab === "notifications" && "Stay up to date"}
              {activeTab === "profile" && "Manage your account"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab("notifications")} className="text-gray-400 hover:text-yellow-400 text-xl">🔔</button>
            <img src={user.imageUrl} alt="Profile"
              className="w-9 h-9 rounded-full border-2 border-yellow-500 object-cover cursor-pointer"
              onClick={() => setActiveTab("profile")} />
          </div>
        </header>

        <div className="p-6">

          {/* HOME TAB */}
          {activeTab === "home" && (
            <div className="flex flex-col gap-6">

              {/* WELCOME CARD */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={user.imageUrl} alt="Profile"
                      className="w-16 h-16 rounded-full border-2 border-yellow-500 object-cover" />
                    <div>
                      <h2 className="text-xl font-extrabold text-white">Welcome back, {firstName}! 👋</h2>
                      <p className="text-gray-400 text-sm">Let&apos;s get your projects done.</p>
                      <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold mt-1 inline-block">
                        ✅ Verified Client
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab("profile")}
                    className="hidden md:flex items-center gap-2 border border-gray-700 hover:border-yellow-500 text-gray-400 hover:text-yellow-400 px-4 py-2 rounded-xl text-sm transition-all">
                    ✏️ Edit Profile
                  </button>
                </div>
              </div>

              {/* STATS CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Active Requests", value: stats.pending, icon: "📋", color: "border-yellow-500", sub: "Awaiting responses" },
                  { label: "Pending", value: stats.pending, icon: "⏳", color: "border-orange-500", sub: "Awaiting responses" },
                  { label: "In Progress", value: stats.active, icon: "🔧", color: "border-blue-500", sub: "Projects ongoing" },
                  { label: "Completed", value: stats.completed, icon: "✅", color: "border-green-500", sub: "Jobs completed" },
                ].map((stat, i) => (
                  <div key={i} className={`bg-gray-900 border-l-4 ${stat.color} rounded-xl p-4`}>
                    <span className="text-2xl block mb-2">{stat.icon}</span>
                    <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                    <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
                    <p className="text-gray-600 text-xs mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* REQUEST OVERVIEW + SPENDING */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* REQUEST OVERVIEW */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold">Request Overview</h3>
                    <span className="text-xs text-gray-500">All Time</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1f2937" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#EAB308" strokeWidth="3"
                          strokeDasharray={`${stats.pending / Math.max(stats.total, 1) * 100} 100`} strokeLinecap="round" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3B82F6" strokeWidth="3"
                          strokeDasharray={`${stats.active / Math.max(stats.total, 1) * 100} 100`}
                          strokeDashoffset={`${-stats.pending / Math.max(stats.total, 1) * 100}`} strokeLinecap="round" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22C55E" strokeWidth="3"
                          strokeDasharray={`${stats.completed / Math.max(stats.total, 1) * 100} 100`}
                          strokeDashoffset={`${-(stats.pending + stats.active) / Math.max(stats.total, 1) * 100}`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-white font-extrabold text-lg">{stats.total}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      {[
                        { label: "Pending", value: stats.pending, color: "bg-yellow-500" },
                        { label: "In Progress", value: stats.active, color: "bg-blue-500" },
                        { label: "Completed", value: stats.completed, color: "bg-green-500" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="text-gray-400 text-xs flex-1">{item.label}</span>
                          <span className="text-white text-xs font-bold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* QUICK ACTIONS */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-white font-bold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: "➕", label: "Post a Job", action: () => setActiveTab("post") },
                      { icon: "📋", label: "My Requests", action: () => setActiveTab("requests") },
                      { icon: "💬", label: "My Messages", action: () => setActiveTab("messages") },
                      { icon: "🤖", label: "AI Assistant", action: () => router.push("/ai-assistant") },
                    ].map((action, i) => (
                      <button key={i} onClick={action.action}
                        className="bg-gray-950 hover:bg-yellow-500 hover:text-black border border-gray-700 hover:border-yellow-500 rounded-xl p-4 text-center transition-all group">
                        <span className="text-2xl block mb-1">{action.icon}</span>
                        <span className="text-xs text-gray-400 group-hover:text-black font-semibold">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RECENT JOB REQUESTS */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold">Recent Job Requests</h3>
                  <button onClick={() => setActiveTab("requests")} className="text-xs text-yellow-400 hover:underline">View All</button>
                </div>
                {recentRequests.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm mb-3">No requests yet.</p>
                    <button onClick={() => setActiveTab("post")}
                      className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2 rounded-xl text-sm transition-all">
                      Post Your First Job
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {recentRequests.map((req, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-950 rounded-xl">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                          req.job_type === "contract" ? "bg-purple-500 bg-opacity-20" : "bg-yellow-500 bg-opacity-20"
                        }`}>
                          {req.job_type === "contract" ? "📋" : "🔧"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold truncate">{req.problem}</p>
                          <p className="text-gray-500 text-xs">📍 {req.location}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            req.status === "pending" ? "bg-yellow-500 text-black" :
                            req.status === "in_progress" ? "bg-blue-500 text-white" :
                            "bg-green-500 text-black"
                          }`}>
                            {req.status.replace("_", " ")}
                          </span>
                          {req.status === "in_progress" && (
                            <a href={`/workspace/${req.id}`} className="text-xs text-yellow-400 hover:underline">
                              Open Workspace →
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI ASSISTANT PROMO */}
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 flex justify-between items-center">
                <div>
                  <p className="text-black font-extrabold text-lg mb-1">🤖 Need help choosing the right engineer?</p>
                  <p className="text-black text-sm">Let our AI recommend the best professionals for your project.</p>
                </div>
                <button onClick={() => router.push("/ai-assistant")}
                  className="bg-black text-yellow-400 font-bold px-6 py-3 rounded-xl text-sm hover:bg-gray-900 transition-all whitespace-nowrap ml-4">
                  Get Recommendations
                </button>
              </div>

            </div>
          )}

          {/* COMMUNITY TAB */}
          {activeTab === "community" && (
            <div className="flex items-center justify-center h-64 flex-col gap-4">
              <p className="text-5xl">💬</p>

              <h2 className="text-2xl font-bold text-white">
                Join the YTE Community
              </h2>

              <p className="text-gray-400 text-center max-w-md">
                Connect with engineers, clients, ask questions, share ideas, and learn from the community.
              </p>

              <a
                href="/community"
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl transition-all"
              >
                Open Community Chat →
              </a>
            </div>
          )}

          {/* POST JOB TAB */}
          {activeTab === "post" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-yellow-400 font-bold text-lg mb-6">🛠️ Post a Job Request</h3>

              {submitted && (
                <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-xl p-4 mb-6 text-center">
                  <p className="text-green-400 font-bold">✅ Request submitted successfully!</p>
                </div>
              )}

              {error && <p className="text-red-400 text-sm mb-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-xl p-3">{error}</p>}

              <label className="block text-gray-400 text-sm mb-2">Describe your problem</label>
              <textarea value={problem} onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g. My inverter is not charging, need urgent help"
                className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 resize-none outline-none mb-6"
                rows={4} />

              <label className="block text-gray-400 text-sm mb-2">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Port Harcourt, Rivers State"
                className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none mb-6" />

              <label className="block text-gray-400 text-sm mb-2">Job Type</label>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { type: "standard", icon: "🔧", title: "Standard Job", desc: "Everyday repairs and installations" },
                  { type: "contract", icon: "📋", title: "Contract Job", desc: "Complex projects requiring certified professionals" },
                ].map((t) => (
                  <button key={t.type} onClick={() => setJobType(t.type)}
                    className={`p-4 rounded-xl text-left transition-all border-2 ${
                      jobType === t.type ? "bg-yellow-500 text-black border-yellow-500" : "bg-gray-950 border-gray-700 text-gray-400"
                    }`}>
                    <div className="text-2xl mb-1">{t.icon}</div>
                    <div className="font-bold text-sm">{t.title}</div>
                    <div className={`text-xs mt-1 ${jobType === t.type ? "text-black" : "text-gray-500"}`}>{t.desc}</div>
                  </button>
                ))}
              </div>

              <label className="block text-gray-400 text-sm mb-2">Urgency</label>
              <div className="flex gap-3 mb-8">
                {["normal", "urgent", "emergency"].map((level) => (
                  <button key={level} onClick={() => setUrgency(level)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all ${
                      urgency === level ? "bg-yellow-500 text-black" : "bg-gray-950 border border-gray-700 text-gray-400"
                    }`}>
                    {level === "normal" ? "🟢" : level === "urgent" ? "🟡" : "🔴"} {level}
                  </button>
                ))}
              </div>

              <button 
  onClick={submitRequest} 
  disabled={submitted || submitting}
  className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all text-lg"
>
  {submitting ? "⚡ Submitting..." : submitted ? "✓ Request Submitted!" : "Submit Job Request ⚡"}
</button>
            </div>
          )}

          {/* REQUESTS TAB */}
          {activeTab === "requests" && (
            <MyRequests clientId={user.id} refreshKey={refreshKey} />
          )}

          {/* MESSAGES TAB */}
          {activeTab === "messages" && (
            <WorkspaceMessages userId={user.id} />
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <Notifications userId={user.id} />
          )}

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-yellow-400 font-bold text-lg mb-6">⚙️ Account Settings</h3>

              <div className="flex items-center gap-4 mb-8 p-4 bg-gray-950 rounded-xl">
                <img src={user.imageUrl} alt="Profile" className="w-16 h-16 rounded-full border-2 border-yellow-500" />
                <div>
                  <p className="text-white font-bold">{fullName || "Client"}</p>
                  <p className="text-gray-400 text-sm">{user.primaryEmailAddress?.emailAddress}</p>
                  <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">✅ Verified Client</span>
                </div>
              </div>

              <label className="block text-gray-400 text-sm mb-2">Full Name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none mb-6" />

              <label className="block text-gray-400 text-sm mb-2">Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 08130223871"
                className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none mb-6" />

              <button onClick={saveProfile} disabled={savingProfile}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-bold py-4 rounded-xl transition-all text-lg">
                {savingProfile ? "Saving..." : profileSaved ? "✓ Saved!" : "Save Changes"}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* BOTTOM NAV - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all relative ${
                activeTab === item.id ? "text-yellow-400" : "text-gray-600"
              }`}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {item.id === "requests" && stats.pending > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}