"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "techkelvin001@gmail.com";

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

  useEffect(() => {
    if (isLoaded) {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!user || email !== ADMIN_EMAIL) {
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
    await supabase
      .from("providers")
      .update({ verified: !verified })
      .eq("clerk_id", clerk_id);
    fetchData();
  };

  const toggleAdmin = async (clerk_id: string, is_admin: boolean) => {
    await supabase
      .from("users")
      .update({ is_admin: !is_admin })
      .eq("clerk_id", clerk_id);
    fetchData();
  };

  const toggleSuspend = async (clerk_id: string, is_suspended: boolean) => {
    await supabase
      .from("users")
      .update({ is_suspended: !is_suspended })
      .eq("clerk_id", clerk_id);
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

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">

        {/* NAV */}
        <div className="flex justify-between items-center mb-12">
          <a href="/">
            <img src="/images/yte-icon.png" alt="YTE Logo" className="h-14 w-auto" />
          </a>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-yellow-500 text-black px-3 py-1 rounded-full font-bold">
              🔐 Admin
            </span>
            <a href="/" className="text-gray-400 hover:text-yellow-400 text-sm font-semibold">
              ← Back to Home
            </a>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-yellow-400 mb-2">Admin Dashboard</h1>
        <p className="text-gray-400 mb-10">Monitor and manage the YTE platform.</p>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Users", value: users.length, icon: "👥" },
            { label: "Total Clients", value: totalClients, icon: "🙋" },
            { label: "Total Providers", value: totalProviders, icon: "👷" },
            { label: "Pending Jobs", value: pendingJobs, icon: "⏳" },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-extrabold text-yellow-400">{stat.value}</div>
              <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-3 mb-8">
          {["overview", "users", "jobs", "providers"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                activeTab === tab
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-900 text-gray-400 hover:text-yellow-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-yellow-400 font-bold mb-4">📊 Job Statistics</h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Pending</span>
                  <span className="text-yellow-400 font-bold">{pendingJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">In Progress</span>
                  <span className="text-blue-400 font-bold">{activeJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Completed</span>
                  <span className="text-green-400 font-bold">{completedJobs}</span>
                </div>
                <div className="flex justify-between border-t border-gray-800 pt-3">
                  <span className="text-gray-400 text-sm">Total Jobs</span>
                  <span className="text-white font-bold">{jobs.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-yellow-400 font-bold mb-4">👥 User Statistics</h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Total Users</span>
                  <span className="text-white font-bold">{users.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Clients</span>
                  <span className="text-yellow-400 font-bold">{totalClients}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Providers</span>
                  <span className="text-blue-400 font-bold">{totalProviders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Admins</span>
                  <span className="text-purple-400 font-bold">{adminUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Suspended</span>
                  <span className="text-red-400 font-bold">{suspendedUsers}</span>
                </div>
                <div className="flex justify-between border-t border-gray-800 pt-3">
                  <span className="text-gray-400 text-sm">Verified Providers</span>
                  <span className="text-green-400 font-bold">{verifiedProviders}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-yellow-400 font-bold mb-6">👥 All Users ({users.length})</h3>
            <div className="flex flex-col gap-3">
              {users.length === 0 && (
                <p className="text-gray-500 text-sm text-center">No users yet.</p>
              )}
              {users.map((u, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {u.photo_url ? (
                        <img
                          src={u.photo_url}
                          alt={u.full_name || "User"}
                          className="w-10 h-10 rounded-full border-2 border-yellow-500"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full border-2 border-yellow-500 bg-gray-800 flex items-center justify-center text-yellow-400 font-bold text-sm">
                          {(u.full_name || "U")[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-bold text-sm">{u.full_name || "Unnamed"}</p>
                        <p className="text-gray-400 text-xs">{u.email}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-bold ${
                            u.role === "client" ? "bg-blue-500 text-white" :
                            u.role === "engineer" ? "bg-purple-500 text-white" :
                            "bg-yellow-500 text-black"
                          }`}>
                            {u.role}
                          </span>
                          {u.is_admin && (
                            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                              🔐 Admin
                            </span>
                          )}
                          {u.is_suspended && (
                            <span className="text-xs bg-gray-600 text-white px-2 py-0.5 rounded-full">
                              🚫 Suspended
                            </span>
                          )}
                        </div>
                        <div className="flex gap-3 mt-1">
                          <p className="text-gray-600 text-xs">
                            ✅ {u.jobs_completed} jobs completed
                          </p>
                          <p className="text-gray-600 text-xs">
                            ⭐ {u.average_rating || 0} rating
                          </p>
                        </div>
                        <p className="text-gray-600 text-xs">
                          📅 Joined: {new Date(u.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => toggleAdmin(u.clerk_id, u.is_admin)}
                        className={`text-xs font-bold px-3 py-1 rounded-lg transition-all ${
                          u.is_admin
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-purple-500 hover:bg-purple-400 text-white"
                        }`}
                      >
                        {u.is_admin ? "Remove Admin" : "Make Admin"}
                      </button>
                      <button
                        onClick={() => toggleSuspend(u.clerk_id, u.is_suspended)}
                        className={`text-xs font-bold px-3 py-1 rounded-lg transition-all ${
                          u.is_suspended
                            ? "bg-green-500 hover:bg-green-400 text-black"
                            : "bg-red-500 hover:bg-red-400 text-white"
                        }`}
                      >
                        {u.is_suspended ? "Unsuspend" : "Suspend"}
                      </button>
                      {u.role !== "client" && (
                        <button
                          onClick={() => sendCongrats(u.email, u.full_name || "Provider")}
                          className="text-xs font-bold px-3 py-1 rounded-lg transition-all bg-yellow-500 hover:bg-yellow-400 text-black"
                        >
                          {emailSent === u.email ? "✓ Sent!" : "🎉 Congrats"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* JOBS TAB */}
        {activeTab === "jobs" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-yellow-400 font-bold mb-6">📋 All Job Requests ({jobs.length})</h3>
            <div className="flex flex-col gap-3">
              {jobs.length === 0 && (
                <p className="text-gray-500 text-sm text-center">No jobs yet.</p>
              )}
              {jobs.map((job, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-bold ${
                        job.status === "pending" ? "bg-yellow-500 text-black" :
                        job.status === "in_progress" ? "bg-blue-500 text-white" :
                        "bg-green-500 text-black"
                      }`}>
                        {job.status.replace("_", " ")}
                      </span>
                      {job.job_type === "contract" && (
                        <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">Contract</span>
                      )}
                      <span className={`text-xs capitalize ${
                        job.urgency === "emergency" ? "text-red-400" :
                        job.urgency === "urgent" ? "text-yellow-400" : "text-gray-400"
                      }`}>
                        {job.urgency}
                      </span>
                    </div>
                    <p className="text-white text-sm font-semibold">{job.client_name}</p>
                    <p className="text-gray-400 text-xs">🔧 {job.problem}</p>
                    <p className="text-gray-500 text-xs">📍 {job.location}</p>
                  </div>
                  <button
                    onClick={() => deleteJob(job.id)}
                    className="text-xs bg-red-500 hover:bg-red-400 text-white font-bold px-3 py-1 rounded-lg transition-all ml-4"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROVIDERS TAB */}
        {activeTab === "providers" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-yellow-400 font-bold mb-6">👷 All Providers ({providers.length})</h3>
            <div className="flex flex-col gap-3">
              {providers.length === 0 && (
                <p className="text-gray-500 text-sm text-center">No providers yet.</p>
              )}
              {providers.map((provider, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {provider.photo_url ? (
                      <img
                        src={provider.photo_url}
                        alt={provider.full_name || "Provider"}
                        className="w-10 h-10 rounded-full border-2 border-yellow-500"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-yellow-500 bg-gray-800 flex items-center justify-center text-yellow-400 font-bold text-sm">
                        {(provider.full_name || "P")[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-bold text-sm">{provider.full_name || "Unnamed"}</p>
                      <p className="text-gray-400 text-xs">{provider.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full capitalize">
                          {provider.role}
                        </span>
                        {provider.verified && (
                          <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">
                            ✓ Verified
                          </span>
                        )}
                        {provider.available ? (
                          <span className="text-xs text-green-400">🟢 Available</span>
                        ) : (
                          <span className="text-xs text-red-400">🔴 Unavailable</span>
                        )}
                      </div>
                      {provider.skills && (
                        <p className="text-gray-500 text-xs mt-1">🛠️ {provider.skills}</p>
                      )}
                      {provider.location && (
                        <p className="text-gray-500 text-xs">📍 {provider.location}</p>
                      )}
                      <p className="text-gray-600 text-xs mt-1">
                        ⭐ {provider.rating || 0} rating
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => verifyProvider(provider.clerk_id, provider.verified)}
                      className={`text-xs font-bold px-3 py-1 rounded-lg transition-all ${
                        provider.verified
                          ? "bg-red-500 hover:bg-red-400 text-white"
                          : "bg-yellow-500 hover:bg-yellow-400 text-black"
                      }`}
                    >
                      {provider.verified ? "Unverify" : "Verify"}
                    </button>
                    <button
                      onClick={() => sendCongrats(provider.email, provider.full_name || "Provider")}
                      className="text-xs bg-purple-500 hover:bg-purple-400 text-white font-bold px-3 py-1 rounded-lg transition-all"
                    >
                      {emailSent === provider.email ? "✓ Sent!" : "🎉 Congrats"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}