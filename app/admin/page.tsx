"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = ["techkelvin001@gmail.com", "chienyimax911@gmail.com"];

type JobRequest = {
  id: string;
  client_id: string;
  client_name: string;
  problem: string;
  location: string;
  urgency: string;
  status: string;
  job_type: string;
};

type Provider = {
  clerk_id: string;
  full_name: string;
  email: string;
  photo_url: string;
  role: string;
  skills: string;
  location: string;
  rating: number;
  verified: boolean;
  available: boolean;
};

type YTEUser = {
  id: number;
  clerk_id: string;
  full_name: string;
  email: string;
  role: string;
  photo_url: string;
  is_admin: boolean;
  is_suspended: boolean;
  jobs_completed: number;
  average_rating: number;
  joined_at: string;
};

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [users, setUsers] = useState<YTEUser[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isLoaded) {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!user || !ADMIN_EMAILS.includes(email || "")) {
        router.push("/");
        return;
      }
      fetchData();
    }
  }, [isLoaded, user]);

  const fetchData = async () => {
    const { data: jobData } = await supabase
      .from("job_requests")
      .select("*")
      .order("id", { ascending: false });

    const { data: providerData } = await supabase
      .from("providers")
      .select("*")
      .order("full_name", { ascending: true });

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .order("joined_at", { ascending: false });

    setJobs(jobData || []);
    setProviders(providerData || []);
    setUsers(userData || []);
    setLoading(false);
  };

  const deleteJob = async (id: string) => {
    await supabase.from("job_requests").delete().eq("id", id);
    fetchData();
  };

  const verifyProvider = async (clerk_id: string, verified: boolean) => {
    await supabase.from("providers").update({ verified: !verified }).eq("clerk_id", clerk_id);
    fetchData();
  };

  const toggleAdmin = async (clerk_id: string, is_admin: boolean) => {
    await supabase.from("users").update({ is_admin: !is_admin }).eq("clerk_id", clerk_id);
    fetchData();
  };

  const toggleSuspend = async (clerk_id: string, is_suspended: boolean) => {
    await supabase.from("users").update({ is_suspended: !is_suspended }).eq("clerk_id", clerk_id);
    fetchData();
  };

  const sendCongrats = (email: string, name: string) => {
    const subject = encodeURIComponent("🎉 Congratulations from Young Technology Engineers!");
    const body = encodeURIComponent(
      `Dear ${name},\n\nCongratulations! Your outstanding performance on the YTE platform has been recognized.\n\nYou have demonstrated exceptional competence and professionalism in your work. Keep it up!\n\nBest regards,\nYTE Admin Team\nYoung Technology Engineers`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
    setEmailSent(email);
    setTimeout(() => setEmailSent(null), 3000);
  };

  if (!isLoaded || loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-yellow-400 animate-pulse">⚡ Loading Admin Dashboard...</p>
      </main>
    );
  }

  const pendingJobs = jobs.filter(j => j.status === "pending").length;
  const activeJobs = jobs.filter(j => j.status === "in_progress").length;
  const completedJobs = jobs.filter(j => j.status === "completed").length;
  const verifiedProviders = providers.filter(p => p.verified).length;
  const totalClients = users.filter(u => u.role?.toLowerCase() === "client").length;
  const totalProviders = users.filter(u => u.role?.toLowerCase() !== "client").length;
  const suspendedUsers = users.filter(u => u.is_suspended).length;
  const adminUsers = users.filter(u => u.is_admin).length;

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredJobs = jobs.filter(j =>
    j.problem?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProviders = providers.filter(p =>
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.skills?.toLowerCase().includes(searchQuery.toLowerCase())
  );

const navItems = [
  { id: "overview", icon: "📊", label: "Overview", badge: 0 },
  { id: "users", icon: "👥", label: "Users", badge: users.length },
  { id: "jobs", icon: "📋", label: "Jobs", badge: pendingJobs },
  { id: "providers", icon: "👷", label: "Providers", badge: providers.length },
  { id: "analytics", icon: "📈", label: "Analytics", badge: 0 },
];
  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-black border-r border-gray-800 min-h-screen fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-gray-800">
          <a href="/"><img src="/images/yte-icon.png" alt="YTE" className="h-12 w-auto mb-2" /></a>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold">🔐 Admin Panel</span>
          </div>
        </div>

        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img src={user?.imageUrl || ""} alt="Admin" className="w-10 h-10 rounded-full border-2 border-yellow-500" />
            <div>
              <p className="text-white font-bold text-sm">{user?.fullName || "Admin"}</p>
              <p className="text-gray-500 text-xs">{user?.primaryEmailAddress?.emailAddress}</p>
              <span className="text-xs text-yellow-400">Super Admin</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <p className="text-gray-600 text-xs font-bold mb-3 uppercase tracking-wider">Main Menu</p>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
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

          <p className="text-gray-600 text-xs font-bold mb-3 mt-6 uppercase tracking-wider">Platform</p>
          <div className="flex flex-col gap-1">
            {[
              { id: "settings", icon: "⚙️", label: "Settings" },
              { id: "help", icon: "❓", label: "Help Center" },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeTab === item.id ? "bg-yellow-500 text-black font-bold" : "text-gray-400 hover:bg-gray-900 hover:text-white"
                }`}>
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800">
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
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "users" && "User Management"}
              {activeTab === "jobs" && "Job Management"}
              {activeTab === "providers" && "Provider Management"}
              {activeTab === "analytics" && "Analytics"}
            </h1>
            <p className="text-gray-500 text-xs">
              {activeTab === "overview" && "Monitor your platform performance"}
              {activeTab === "users" && `${users.length} total registered users`}
              {activeTab === "jobs" && `${jobs.length} total job requests`}
              {activeTab === "providers" && `${providers.length} registered providers`}
              {activeTab === "analytics" && "Platform insights and metrics"}
            </p>
          </div>

          {/* SEARCH BAR */}
          {["users", "jobs", "providers"].includes(activeTab) && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="bg-gray-900 border border-gray-700 focus:border-yellow-500 rounded-xl px-4 py-2 text-white placeholder-gray-500 outline-none text-sm w-48"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">🔍</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-xs bg-yellow-500 text-black px-3 py-1 rounded-full font-bold">🔐 Admin</span>
            <img src={user?.imageUrl || ""} alt="Admin" className="w-9 h-9 rounded-full border-2 border-yellow-500" />
          </div>
        </header>

        <div className="p-6">

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">

              {/* STATS CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", value: users.length, icon: "👥", color: "border-blue-500", sub: `${totalClients} clients • ${totalProviders} providers` },
                  { label: "Total Jobs", value: jobs.length, icon: "📋", color: "border-yellow-500", sub: `${pendingJobs} pending • ${activeJobs} active` },
                  { label: "Verified Providers", value: verifiedProviders, icon: "✅", color: "border-green-500", sub: `${providers.length - verifiedProviders} unverified` },
                  { label: "Completed Jobs", value: completedJobs, icon: "🏆", color: "border-purple-500", sub: `${activeJobs} in progress` },
                ].map((stat, i) => (
                  <div key={i} className={`bg-gray-900 border-l-4 ${stat.color} rounded-xl p-4`}>
                    <span className="text-2xl block mb-2">{stat.icon}</span>
                    <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                    <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
                    <p className="text-gray-600 text-xs mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* JOB STATS + USER STATS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-yellow-400 font-bold mb-6">📊 Job Statistics</h3>
                  <div className="flex flex-col gap-4">
                    {[
                      { label: "Pending", value: pendingJobs, total: jobs.length, color: "bg-yellow-500" },
                      { label: "In Progress", value: activeJobs, total: jobs.length, color: "bg-blue-500" },
                      { label: "Completed", value: completedJobs, total: jobs.length, color: "bg-green-500" },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{item.label}</span>
                          <span className="text-white font-bold">{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className={`${item.color} h-2 rounded-full`}
                            style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-gray-800 pt-3 mt-2">
                      <span className="text-gray-400 text-sm">Total Jobs</span>
                      <span className="text-white font-bold">{jobs.length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-yellow-400 font-bold mb-6">👥 User Statistics</h3>
                  <div className="flex flex-col gap-4">
                    {[
                      { label: "Clients", value: totalClients, total: users.length, color: "bg-blue-500" },
                      { label: "Providers", value: totalProviders, total: users.length, color: "bg-yellow-500" },
                      { label: "Verified Providers", value: verifiedProviders, total: providers.length, color: "bg-green-500" },
                      { label: "Admins", value: adminUsers, total: users.length, color: "bg-purple-500" },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{item.label}</span>
                          <span className="text-white font-bold">{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className={`${item.color} h-2 rounded-full`}
                            style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-gray-800 pt-3 mt-2">
                      <span className="text-gray-400 text-sm">Suspended</span>
                      <span className="text-red-400 font-bold">{suspendedUsers}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">⚡ Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: "👥", label: "Manage Users", action: () => setActiveTab("users") },
                    { icon: "📋", label: "Review Jobs", action: () => setActiveTab("jobs") },
                    { icon: "👷", label: "Verify Providers", action: () => setActiveTab("providers") },
                    { icon: "📈", label: "View Analytics", action: () => setActiveTab("analytics") },
                  ].map((action, i) => (
                    <button key={i} onClick={action.action}
                      className="bg-gray-950 hover:bg-yellow-500 hover:text-black border border-gray-700 hover:border-yellow-500 rounded-xl p-4 text-center transition-all group">
                      <span className="text-2xl block mb-1">{action.icon}</span>
                      <span className="text-xs text-gray-400 group-hover:text-black font-semibold">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* RECENT ACTIVITY */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">🕐 Recent Job Activity</h3>
                <div className="flex flex-col gap-3">
                  {jobs.slice(0, 5).map((job, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-950 rounded-xl">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                        job.job_type === "contract" ? "bg-purple-500 bg-opacity-20" : "bg-yellow-500 bg-opacity-20"
                      }`}>
                        {job.job_type === "contract" ? "📋" : "🔧"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{job.problem}</p>
                        <p className="text-gray-500 text-xs">{job.client_name} • 📍 {job.location}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 ${
                        job.status === "pending" ? "bg-yellow-500 text-black" :
                        job.status === "in_progress" ? "bg-blue-500 text-white" :
                        "bg-green-500 text-black"
                      }`}>{job.status.replace("_", " ")}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <div className="flex flex-col gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-yellow-400 font-bold text-lg">👥 All Users ({filteredUsers.length})</h3>
                  <div className="flex gap-2">
                    {["all", "client", "engineer", "technician"].map((filter) => (
                      <button key={filter}
                        className="text-xs bg-gray-800 hover:bg-yellow-500 hover:text-black text-gray-400 px-3 py-1 rounded-full capitalize transition-all"
                        onClick={() => setSearchQuery(filter === "all" ? "" : filter)}>
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {filteredUsers.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No users found.</p>}
                  {filteredUsers.map((u, i) => (
                    <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {u.photo_url ? (
                            <img src={u.photo_url} alt={u.full_name || "User"}
                              className="w-10 h-10 rounded-full border-2 border-yellow-500" />
                          ) : (
                            <div className="w-10 h-10 rounded-full border-2 border-yellow-500 bg-gray-800 flex items-center justify-center text-yellow-400 font-bold">
                              {(u.full_name || "U")[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-bold text-sm">{u.full_name || "Unnamed"}</p>
                            <p className="text-gray-400 text-xs">{u.email}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-bold ${
                                u.role?.toLowerCase() === "client" ? "bg-blue-500 text-white" :
                                u.role?.toLowerCase() === "engineer" ? "bg-purple-500 text-white" :
                                "bg-yellow-500 text-black"
                              }`}>{u.role}</span>
                              {u.is_admin && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">🔐 Admin</span>}
                              {u.is_suspended && <span className="text-xs bg-gray-600 text-white px-2 py-0.5 rounded-full">🚫 Suspended</span>}
                            </div>
                            <div className="flex gap-3 mt-1">
                              <p className="text-gray-600 text-xs">✅ {u.jobs_completed} jobs</p>
                              <p className="text-gray-600 text-xs">⭐ {u.average_rating || 0} rating</p>
                              <p className="text-gray-600 text-xs">📅 {new Date(u.joined_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <button onClick={() => toggleAdmin(u.clerk_id, u.is_admin)}
                            className={`text-xs font-bold px-3 py-1 rounded-lg transition-all ${
                              u.is_admin ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-purple-500 hover:bg-purple-400 text-white"
                            }`}>
                            {u.is_admin ? "Remove Admin" : "Make Admin"}
                          </button>
                          <button onClick={() => toggleSuspend(u.clerk_id, u.is_suspended)}
                            className={`text-xs font-bold px-3 py-1 rounded-lg transition-all ${
                              u.is_suspended ? "bg-green-500 hover:bg-green-400 text-black" : "bg-red-500 hover:bg-red-400 text-white"
                            }`}>
                            {u.is_suspended ? "Unsuspend" : "Suspend"}
                          </button>
                          {u.role !== "client" && (
                            <button onClick={() => sendCongrats(u.email, u.full_name || "Provider")}
                              className="text-xs font-bold px-3 py-1 rounded-lg transition-all bg-yellow-500 hover:bg-yellow-400 text-black">
                              {emailSent === u.email ? "✓ Sent!" : "🎉 Congrats"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* JOBS TAB */}
          {activeTab === "jobs" && (
            <div className="flex flex-col gap-4">
              {/* JOB STATS */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Pending", value: pendingJobs, color: "bg-yellow-500" },
                  { label: "In Progress", value: activeJobs, color: "bg-blue-500" },
                  { label: "Completed", value: completedJobs, color: "bg-green-500" },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                    <div className={`w-3 h-3 ${s.color} rounded-full mx-auto mb-2`} />
                    <p className="text-2xl font-extrabold text-white">{s.value}</p>
                    <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-yellow-400 font-bold text-lg mb-6">📋 All Job Requests ({filteredJobs.length})</h3>
                <div className="flex flex-col gap-3">
                  {filteredJobs.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No jobs found.</p>}
                  {filteredJobs.map((job, i) => (
                    <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                          job.job_type === "contract" ? "bg-purple-500 bg-opacity-20" : "bg-yellow-500 bg-opacity-20"
                        }`}>
                          {job.job_type === "contract" ? "📋" : "🔧"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-bold ${
                              job.status === "pending" ? "bg-yellow-500 text-black" :
                              job.status === "in_progress" ? "bg-blue-500 text-white" :
                              "bg-green-500 text-black"
                            }`}>{job.status.replace("_", " ")}</span>
                            {job.job_type === "contract" && (
                              <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">Contract</span>
                            )}
                            <span className={`text-xs capitalize ${
                              job.urgency === "emergency" ? "text-red-400" :
                              job.urgency === "urgent" ? "text-yellow-400" : "text-gray-400"
                            }`}>{job.urgency}</span>
                          </div>
                          <p className="text-white text-sm font-semibold">{job.client_name}</p>
                          <p className="text-gray-400 text-xs">🔧 {job.problem}</p>
                          <p className="text-gray-500 text-xs">📍 {job.location}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteJob(job.id)}
                        className="text-xs bg-red-500 hover:bg-red-400 text-white font-bold px-3 py-1 rounded-lg transition-all ml-4 flex-shrink-0">
                        🗑️ Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PROVIDERS TAB */}
          {activeTab === "providers" && (
            <div className="flex flex-col gap-4">
              {/* PROVIDER STATS */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Providers", value: providers.length, color: "border-yellow-500" },
                  { label: "Verified", value: verifiedProviders, color: "border-green-500" },
                  { label: "Unverified", value: providers.length - verifiedProviders, color: "border-red-500" },
                ].map((s, i) => (
                  <div key={i} className={`bg-gray-900 border-l-4 ${s.color} rounded-xl p-4 text-center`}>
                    <p className="text-2xl font-extrabold text-white">{s.value}</p>
                    <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-yellow-400 font-bold text-lg mb-6">👷 All Providers ({filteredProviders.length})</h3>
                <div className="flex flex-col gap-3">
                  {filteredProviders.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No providers found.</p>}
                  {filteredProviders.map((provider, i) => (
                    <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {provider.photo_url ? (
                          <img src={provider.photo_url} alt={provider.full_name || "Provider"}
                            className="w-12 h-12 rounded-full border-2 border-yellow-500 object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full border-2 border-yellow-500 bg-gray-800 flex items-center justify-center text-yellow-400 font-bold">
                            {(provider.full_name || "P")[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-bold text-sm">{provider.full_name || "Unnamed"}</p>
                            {provider.verified && (
                              <span className="text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold">✓ Verified</span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs">{provider.email}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full capitalize">{provider.role}</span>
                            {provider.available ? (
                              <span className="text-xs text-green-400">🟢 Available</span>
                            ) : (
                              <span className="text-xs text-red-400">🔴 Unavailable</span>
                            )}
                            <span className="text-xs text-gray-500">⭐ {provider.rating || 0}</span>
                          </div>
                          {provider.skills && <p className="text-gray-500 text-xs mt-1">🛠️ {provider.skills}</p>}
                          {provider.location && <p className="text-gray-500 text-xs">📍 {provider.location}</p>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <button onClick={() => verifyProvider(provider.clerk_id, provider.verified)}
                          className={`text-xs font-bold px-3 py-1 rounded-lg transition-all ${
                            provider.verified ? "bg-red-500 hover:bg-red-400 text-white" : "bg-yellow-500 hover:bg-yellow-400 text-black"
                          }`}>
                          {provider.verified ? "Unverify" : "✓ Verify"}
                        </button>
                        <a href={`/provider/${provider.clerk_id}`} target="_blank"
                          className="text-xs bg-gray-700 hover:bg-gray-600 text-white font-bold px-3 py-1 rounded-lg transition-all text-center">
                          View Profile
                        </a>
                        <button onClick={() => sendCongrats(provider.email, provider.full_name || "Provider")}
                          className="text-xs bg-purple-500 hover:bg-purple-400 text-white font-bold px-3 py-1 rounded-lg transition-all">
                          {emailSent === provider.email ? "✓ Sent!" : "🎉 Congrats"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Platform Growth", value: `+${users.length}`, icon: "📈", color: "border-green-500" },
                  { label: "Job Success Rate", value: `${jobs.length > 0 ? Math.round((completedJobs / jobs.length) * 100) : 0}%`, icon: "✅", color: "border-yellow-500" },
                  { label: "Provider Verify Rate", value: `${providers.length > 0 ? Math.round((verifiedProviders / providers.length) * 100) : 0}%`, icon: "👷", color: "border-blue-500" },
                  { label: "Active Rate", value: `${jobs.length > 0 ? Math.round((activeJobs / jobs.length) * 100) : 0}%`, icon: "⚡", color: "border-purple-500" },
                ].map((stat, i) => (
                  <div key={i} className={`bg-gray-900 border-l-4 ${stat.color} rounded-xl p-4`}>
                    <span className="text-2xl block mb-2">{stat.icon}</span>
                    <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                    <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-yellow-400 font-bold mb-4">👥 User Distribution</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Clients", value: totalClients, total: users.length, color: "bg-blue-500" },
                      { label: "Engineers", value: users.filter(u => u.role?.toLowerCase() === "engineer").length, total: users.length, color: "bg-purple-500" },
                      { label: "Technicians", value: users.filter(u => u.role?.toLowerCase() === "technician").length, total: users.length, color: "bg-yellow-500" },
                      { label: "Admins", value: adminUsers, total: users.length, color: "bg-red-500" },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{item.label}</span>
                          <span className="text-white font-bold">{item.value} ({item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}%)</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className={`${item.color} h-2 rounded-full`}
                            style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-yellow-400 font-bold mb-4">📋 Job Distribution</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Standard Jobs", value: jobs.filter(j => j.job_type === "standard").length, total: jobs.length, color: "bg-yellow-500" },
                      { label: "Contract Jobs", value: jobs.filter(j => j.job_type === "contract").length, total: jobs.length, color: "bg-purple-500" },
                      { label: "Emergency", value: jobs.filter(j => j.urgency === "emergency").length, total: jobs.length, color: "bg-red-500" },
                      { label: "Urgent", value: jobs.filter(j => j.urgency === "urgent").length, total: jobs.length, color: "bg-orange-500" },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{item.label}</span>
                          <span className="text-white font-bold">{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className={`${item.color} h-2 rounded-full`}
                            style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* BOTTOM NAV - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 transition-all relative ${
                activeTab === item.id ? "text-yellow-400" : "text-gray-600"
              }`}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}