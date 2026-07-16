"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import JobRequests from "./JobRequests";
import AcceptedJobs from "./AcceptedJobs";
import Notifications from "../Notifications";

function RecentJobs({ onViewAll }: { onViewAll: () => void }) {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("job_requests")
      .select("*")
      .eq("status", "pending")
      .limit(4)
      .order("client_id", { ascending: false })
      .then(({ data }) => setJobs(data || []));
  }, []);

  if (jobs.length === 0) return <p className="text-gray-500 text-sm text-center">No jobs available right now.</p>;

  return (
    <div className="flex flex-col gap-3">
      {jobs.map((job, i) => (
        <div key={i} onClick={onViewAll} className="flex items-center gap-3 p-3 bg-gray-950 rounded-xl hover:bg-gray-800 transition-all cursor-pointer">
          <div className="w-10 h-10 bg-yellow-500 bg-opacity-20 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
            {job.job_type === "contract" ? "📋" : "🔧"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{job.problem}</p>
            <p className="text-gray-500 text-xs">📍 {job.location}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 ${
            job.urgency === "emergency" ? "bg-red-500 text-white" :
            job.urgency === "urgent" ? "bg-orange-500 text-white" :
            "bg-gray-700 text-gray-300"
          }`}>
            {job.urgency}
          </span>
        </div>
      ))}
    </div>
  );
}

function ActiveJobsList({ userId }: { userId: string }) {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("job_requests")
      .select("*")
      .eq("assigned_to", userId)
      .eq("status", "in_progress")
      .limit(3)
      .then(({ data }) => setJobs(data || []));
  }, [userId]);

  if (jobs.length === 0) return <p className="text-gray-500 text-sm text-center">No active jobs yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      {jobs.map((job, i) => (
        <a key={i} href={`/workspace/${job.id}`} className="block p-3 bg-gray-950 rounded-xl hover:bg-gray-800 transition-all">
          <div className="flex justify-between items-start mb-2">
            <p className="text-white text-sm font-semibold">{job.problem}</p>
            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">In Progress</span>
          </div>
          <p className="text-gray-500 text-xs mb-2">📍 {job.location}</p>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: "60%" }} />
          </div>
          <p className="text-gray-600 text-xs mt-1">60% complete • <span className="text-yellow-400">Open Workspace →</span></p>
        </a>
      ))}
    </div>
  );
}

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
        <p className="text-gray-500 text-sm">Messages appear here when a client hires you.</p>
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
              <p className="text-gray-500 text-xs">Client: {ws.client_name}</p>
              <p className="text-yellow-400 text-xs mt-1">Open workspace →</p>
            </div>
            <span className="text-xs bg-green-500 text-black px-2 py-1 rounded-full font-bold flex-shrink-0">Active</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [certifications, setCertifications] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [serviceCoverage, setServiceCoverage] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [availabilityDays, setAvailabilityDays] = useState<string[]>([]);
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [stats, setStats] = useState({ jobsCompleted: 0, rating: 0, pending: 0, activeJobs: 0 });

  useEffect(() => {
    if (isLoaded && user) {
      const meta = user.unsafeMetadata;
      setFullName(user.fullName || "");
      setSkills((meta?.skills as string) || "");
      setLocation((meta?.location as string) || "");
      setAvailable(meta?.available !== false);

      supabase.from("providers").select("*").eq("clerk_id", user.id).single()
        .then(({ data }) => {
          if (data?.photo_url) setPhotoUrl(data.photo_url);
          else setPhotoUrl(user.imageUrl || "");
          setStats(prev => ({ ...prev, rating: data?.rating || 0 }));
          setBio(data?.bio || "");
          setCertifications(data?.certifications || "");
          setYearsExperience(data?.years_experience?.toString() || "");
          setServiceCoverage(data?.service_coverage || "");
          setLinkedinUrl(data?.linkedin_url || "");
          setPortfolioUrl(data?.portfolio_url || "");
          setAvailabilityDays(data?.availability_days || []);
        });

      supabase.from("job_requests").select("*").eq("assigned_to", user.id).eq("status", "completed")
        .then(({ data }) => setStats(prev => ({ ...prev, jobsCompleted: data?.length || 0 })));

      supabase.from("job_requests").select("*").eq("status", "pending")
        .then(({ data }) => setStats(prev => ({ ...prev, pending: data?.length || 0 })));

      supabase.from("job_requests").select("*").eq("assigned_to", user.id).eq("status", "in_progress")
        .then(({ data }) => setStats(prev => ({ ...prev, activeJobs: data?.length || 0 })));
    }
  }, [isLoaded, user]);

  if (!isLoaded) return null;
  if (!user) { router.push("/"); return null; }

  const role = user.unsafeMetadata?.role as string | undefined;
  if (role !== "technician" && role !== "engineer") {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
        <p className="text-gray-400 mb-4">This dashboard is for Technicians/Engineers only.</p>
        <a href="/" className="text-yellow-400 hover:underline">← Back to Home</a>
      </main>
    );
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setUploadSuccess(false);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setPhotoUrl(data.publicUrl);
      await supabase.from("providers").update({ photo_url: data.publicUrl }).eq("clerk_id", user.id);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) { console.error(error); }
    finally { setUploading(false); }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/cover.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await supabase.from("providers").update({ cover_url: data.publicUrl }).eq("clerk_id", user.id);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) { console.error(error); }
    finally { setUploading(false); }
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

  const saveProfile = async () => {
    setSaving(true);
    try {
      const coords = await getLocation();
      await user.update({
        firstName: fullName.split(" ")[0],
        lastName: fullName.split(" ").slice(1).join(" "),
        unsafeMetadata: { ...user.unsafeMetadata, skills, location, available },
      });

      const { data: existing } = await supabase.from("providers").select("*").eq("clerk_id", user.id).single();
      const profileData = {
        full_name: fullName,
        email: user.primaryEmailAddress?.emailAddress || "",
        photo_url: photoUrl || user.imageUrl || "",
        role: role || "",
        skills, location, available,
        latitude: coords.lat, longitude: coords.lng,
        bio, certifications,
        years_experience: parseInt(yearsExperience) || 0,
        service_coverage: serviceCoverage,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl,
        availability_days: availabilityDays,
      };

      if (existing) {
        await supabase.from("providers").update(profileData).eq("clerk_id", user.id);
      } else {
        await supabase.from("providers").insert({ ...profileData, clerk_id: user.id, rating: 0, verified: false });
      }

      setSaved(true);
      setActiveTab("home");
      setTimeout(() => setSaved(false), 2000);
    } catch (error) { console.error(error); }
    finally { setSaving(false); }
  };

  const navItems = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "jobs", icon: "📋", label: "Jobs" },
    { id: "active", icon: "⚡", label: "Active" },
    { id: "messages", icon: "💬", label: "Messages" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];

  const firstName = fullName.split(" ")[0] || "Provider";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* SIDEBAR - Desktop Only */}
      <aside className="hidden md:flex flex-col w-64 bg-black border-r border-gray-800 min-h-screen fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-gray-800">
          <a href="/"><img src="/images/yte-icon.png" alt="YTE" className="h-12 w-auto" /></a>
        </div>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img src={photoUrl || user.imageUrl} alt="Profile" className="w-10 h-10 rounded-full border-2 border-yellow-500 object-cover" />
            <div>
              <p className="text-white font-bold text-sm">{fullName || "Provider"}</p>
              <p className="text-gray-500 text-xs capitalize">{role}</p>
              <span className={`text-xs ${available ? "text-green-400" : "text-red-400"}`}>
                {available ? "🟢 Available" : "🔴 Unavailable"}
              </span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <div className="flex flex-col gap-1">
            {[
              { id: "home", icon: "🏠", label: "Dashboard", badge: 0 },
              { id: "jobs", icon: "📋", label: "Job Requests", badge: stats.pending },
              { id: "active", icon: "⚡", label: "Active Jobs", badge: stats.activeJobs },
              { id: "messages", icon: "💬", label: "Messages", badge: 0 },
              { id: "notifications", icon: "🔔", label: "Notifications", badge: 0 },
              { id: "profile", icon: "👤", label: "Edit Profile", badge: 0 },
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
        <div className="p-4 border-t border-gray-800">
          <a href={`/provider/${user.id}`} target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-900 hover:text-white transition-all text-sm">
            <span>🌐</span><span>Public Profile</span>
          </a>
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
              {activeTab === "home" && `Good day, ${firstName}! 👋`}
              {activeTab === "jobs" && "Job Requests"}
              {activeTab === "active" && "Active Jobs"}
              {activeTab === "messages" && "Messages"}
              {activeTab === "notifications" && "Notifications"}
              {activeTab === "profile" && "Edit Profile"}
            </h1>
            <p className="text-gray-500 text-xs">
              {activeTab === "home" && "Here's what's happening with your career"}
              {activeTab === "jobs" && `${stats.pending} jobs available`}
              {activeTab === "active" && `${stats.activeJobs} jobs in progress`}
              {activeTab === "messages" && "Your project conversations"}
              {activeTab === "notifications" && "Stay up to date"}
              {activeTab === "profile" && "Update your professional info"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab("notifications")} className="text-gray-400 hover:text-yellow-400 text-xl">🔔</button>
            <img src={photoUrl || user.imageUrl} alt="Profile"
              className="w-9 h-9 rounded-full border-2 border-yellow-500 object-cover cursor-pointer"
              onClick={() => setActiveTab("profile")} />
          </div>
        </header>

        <div className="p-6">

          {/* HOME TAB */}
          {activeTab === "home" && (
            <div className="flex flex-col gap-6">

              {/* STATS CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Jobs Completed", value: stats.jobsCompleted, icon: "✅", color: "border-green-500", sub: "+12% this month" },
                  { label: "Your Rating", value: `${stats.rating || 0}⭐`, icon: "🏆", color: "border-yellow-500", sub: "Average score" },
                  { label: "New Jobs", value: stats.pending, icon: "📋", color: "border-blue-500", sub: `+${stats.pending} today` },
                  { label: "Active Jobs", value: stats.activeJobs, icon: "⚡", color: "border-purple-500", sub: "In progress" },
                ].map((stat, i) => (
                  <div key={i} className={`bg-gray-900 border-l-4 ${stat.color} rounded-xl p-4`}>
                    <span className="text-2xl block mb-2">{stat.icon}</span>
                    <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                    <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
                    <p className="text-green-400 text-xs mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* PROFILE VIEWS + JOB CATEGORY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold">Profile Views</h3>
                    <span className="text-xs text-gray-500">This Week</span>
                  </div>
                  <p className="text-3xl font-extrabold text-yellow-400 mb-1">
                    {stats.jobsCompleted * 12 + 24}
                    <span className="text-green-400 text-sm ml-2">+18%</span>
                  </p>
                  <p className="text-gray-500 text-xs mb-4">People viewed your profile</p>
                  <div className="flex items-end gap-1 h-16">
                    {[40, 65, 45, 80, 55, 90, 128].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-yellow-500 rounded-sm opacity-70 hover:opacity-100 transition-all"
                          style={{ height: `${(h / 128) * 100}%` }} />
                        <span className="text-gray-600 text-xs">{["M","T","W","T","F","S","S"][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-white font-bold mb-4">Job Category Insights</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Electrical", percent: 40, color: "bg-yellow-500" },
                      { label: "Solar", percent: 30, color: "bg-orange-500" },
                      { label: "Plumbing", percent: 20, color: "bg-blue-500" },
                      { label: "Automation", percent: 10, color: "bg-purple-500" },
                    ].map((cat, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300">{cat.label}</span>
                          <span className="text-gray-500">{cat.percent}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className={`${cat.color} h-2 rounded-full`} style={{ width: `${cat.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AVAILABILITY */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold">Availability Status</h3>
                  <button onClick={() => setAvailable(!available)}
                    className={`w-14 h-7 rounded-full transition-all relative ${available ? "bg-yellow-500" : "bg-gray-700"}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${available ? "left-8" : "left-1"}`} />
                  </button>
                </div>
                <p className={`text-sm mb-4 ${available ? "text-green-400" : "text-red-400"}`}>
                  {available ? "🟢 You are visible to clients and receiving jobs" : "🔴 You are hidden from clients"}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Response Rate", value: "98%" },
                    { label: "Job Success", value: "95%" },
                    { label: "On-Time Rate", value: "100%" },
                  ].map((m, i) => (
                    <div key={i} className="text-center bg-gray-950 rounded-xl p-3">
                      <p className="text-yellow-400 font-extrabold text-lg">{m.value}</p>
                      <p className="text-gray-500 text-xs mt-1">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENT JOBS + ACTIVE JOBS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold">Recent Job Requests</h3>
                    <button onClick={() => setActiveTab("jobs")} className="text-xs text-yellow-400 hover:underline">View All</button>
                  </div>
                  <RecentJobs onViewAll={() => setActiveTab("jobs")} />
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold">My Active Jobs</h3>
                    <button onClick={() => setActiveTab("active")} className="text-xs text-yellow-400 hover:underline">View All</button>
                  </div>
                  <ActiveJobsList userId={user.id} />
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: "📋", label: "Browse Jobs", action: () => setActiveTab("jobs") },
                    { icon: "👤", label: "Edit Profile", action: () => setActiveTab("profile") },
                    { icon: "🌐", label: "Public Profile", action: () => window.open(`/provider/${user.id}`, "_blank") },
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

              {/* CAREER TIP */}
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6">
                <p className="text-black text-xs font-bold mb-2">💡 CAREER TIP</p>
                <p className="text-black font-bold text-lg mb-1">
                  &quot;Engineers solve problems that change the world. Keep building, keep learning, keep leading.&quot;
                </p>
                <p className="text-black text-opacity-70 text-xs">— YTE Community</p>
              </div>

            </div>
          )}

          {/* JOBS TAB */}
          {activeTab === "jobs" && <JobRequests />}

          {/* ACTIVE JOBS TAB */}
          {activeTab === "active" && <AcceptedJobs providerId={user.id} />}

          {/* MESSAGES TAB */}
          {activeTab === "messages" && <WorkspaceMessages userId={user.id} />}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && <Notifications userId={user.id} />}

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-yellow-400 font-bold text-lg">⚙️ Edit Profile</h3>
                <a href={`/provider/${user.id}`} target="_blank"
                  className="text-xs bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-3 py-2 rounded-lg transition-all">
                  👁️ View Public Profile
                </a>
              </div>

              <label className="block text-gray-400 text-sm mb-2">Cover Photo</label>
              <input type="file" accept="image/*" onChange={handleCoverUpload}
                className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-3 text-white outline-none text-sm mb-6" />

              <label className="block text-gray-400 text-sm mb-2">Profile Photo</label>
              <input type="file" accept="image/*" onChange={handlePhotoUpload}
                className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-3 text-white outline-none text-sm mb-2" />
              {uploading && <p className="text-yellow-400 text-xs mb-4">⚡ Uploading...</p>}
              {uploadSuccess && <p className="text-green-400 text-xs mb-4">✅ Uploaded!</p>}

              <label className="block text-gray-400 text-sm mb-2">Full Name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. John Doe"
                className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none mb-6" />

              <label className="block text-gray-400 text-sm mb-2">Professional Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Specialist in solar systems with 8 years experience"
                className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 resize-none outline-none mb-6" rows={3} />

              <label className="block text-gray-400 text-sm mb-2">Skills <span className="text-gray-600">(comma separated)</span></label>
              <textarea value={skills} onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Electrical wiring, Solar installation, Borehole repair"
                className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 resize-none outline-none mb-6" rows={2} />

              <label className="block text-gray-400 text-sm mb-2">Certifications <span className="text-gray-600">(comma separated)</span></label>
              <input value={certifications} onChange={(e) => setCertifications(e.target.value)}
                placeholder="e.g. COREN, NAFDAC, ISO 9001"
                className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none mb-6" />

              <label className="block text-gray-400 text-sm mb-2">Years of Experience</label>
              <input value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)}
                placeholder="e.g. 8" type="number"
                className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none mb-6" />

              <label className="block text-gray-400 text-sm mb-2">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Port Harcourt, Rivers State"
                className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none mb-6" />

              <label className="block text-gray-400 text-sm mb-2">Service Coverage</label>
              <input value={serviceCoverage} onChange={(e) => setServiceCoverage(e.target.value)}
                placeholder="e.g. Nigeria, Ghana, West Africa"
                className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none mb-6" />

              <label className="block text-gray-400 text-sm mb-2">LinkedIn URL</label>
              <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="e.g. https://linkedin.com/in/yourname"
                className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none mb-6" />

              <label className="block text-gray-400 text-sm mb-2">Portfolio URL</label>
              <input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="e.g. https://yourportfolio.com"
                className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none mb-6" />

              <label className="block text-gray-400 text-sm mb-3">Available Days</label>
              <div className="grid grid-cols-7 gap-2 mb-6">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <button key={day}
                    onClick={() => {
                      const updated = availabilityDays.includes(day)
                        ? availabilityDays.filter(d => d !== day)
                        : [...availabilityDays, day];
                      setAvailabilityDays(updated);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      availabilityDays.includes(day) ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-500 hover:bg-gray-700"
                    }`}>
                    {day}
                  </button>
                ))}
              </div>

              <p className="text-gray-500 text-xs mb-6">📍 GPS coordinates saved automatically.</p>

              <button onClick={saveProfile} disabled={saving}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-bold py-4 rounded-xl transition-all text-lg">
                {saving ? "Saving..." : saved ? "✓ Profile Saved!" : "Save Profile"}
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
              {item.id === "jobs" && stats.pending > 0 && (
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