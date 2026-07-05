"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import MyRequests from "./MyRequests";

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
  const [showPostJob, setShowPostJob] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [stats, setStats] = useState({ active: 0, completed: 0, pending: 0 });

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
        .then(({ data }) => {
          const active = data?.filter(j => j.status === "in_progress").length || 0;
          const completed = data?.filter(j => j.status === "completed").length || 0;
          const pending = data?.filter(j => j.status === "pending").length || 0;
          setStats({ active, completed, pending });
        });
    }
  }, [isLoaded, user]);

  if (!isLoaded) return null;

  if (!user) {
    router.push("/");
    return null;
  }

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
      setShowEditProfile(false);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setSavingProfile(false);
    }
  };

  const submitRequest = async () => {
    if (!problem.trim() || !location.trim()) {
      setError("Please fill in both the problem and location fields.");
      return;
    }
    setError("");

    const { error: dbError } = await supabase.from("job_requests").insert({
      client_id: user.id,
      client_name: user.fullName || fullName || "Client",
      problem,
      location,
      urgency,
      status: "pending",
      job_type: jobType,
    });

    if (dbError) {
      setError("Failed to submit request. Please try again.");
      console.error(dbError);
      return;
    }

    setSubmitted(true);
    setRefreshKey(prev => prev + 1);
    setShowPostJob(false);
    setStats(prev => ({ ...prev, pending: prev.pending + 1 }));
    setTimeout(() => {
      setSubmitted(false);
      setProblem("");
      setLocation("");
      setUrgency("normal");
      setJobType("standard");
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-2xl mx-auto">

        {/* NAV */}
        <div className="flex justify-between items-center mb-8">
          <a href="/">
            <img src="/images/yte-icon.png" alt="YTE Logo" className="h-14 w-auto" />
          </a>
          <a href="/" className="text-gray-400 hover:text-yellow-400 text-sm font-semibold">← Back to Home</a>
        </div>

        {/* WELCOME HEADER */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={user.imageUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full border-2 border-yellow-500 object-cover"
              />
              <div>
                <h1 className="text-xl font-extrabold text-white">
                  👋 Welcome, {fullName.split(" ")[0] || "Client"}!
                </h1>
                <p className="text-gray-400 text-sm">🙋 Client Account</p>
                <p className="text-gray-500 text-xs">{user.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
            <button
              onClick={() => setShowEditProfile(!showEditProfile)}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg transition-all"
            >
              ⚙️ Edit Profile
            </button>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Pending", value: stats.pending, icon: "⏳" },
            { label: "In Progress", value: stats.active, icon: "🔧" },
            { label: "Completed", value: stats.completed, icon: "✅" },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-extrabold text-yellow-400">{stat.value}</div>
              <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* EDIT PROFILE */}
        {showEditProfile && (
          <div className="bg-gray-900 border border-yellow-500 rounded-2xl p-6 mb-6">
            <h3 className="text-yellow-400 font-bold mb-6">⚙️ Edit Profile</h3>

            <label className="block text-gray-400 text-sm mb-2">Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none mb-6"
            />

            <label className="block text-gray-400 text-sm mb-2">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 07012345678"
              className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={saveProfile}
                disabled={savingProfile}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-bold py-3 rounded-xl transition-all"
              >
                {savingProfile ? "Saving..." : profileSaved ? "✓ Saved!" : "Save Profile"}
              </button>
              <button
                onClick={() => setShowEditProfile(false)}
                className="px-6 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* POST NEW JOB BUTTON */}
        <button
          onClick={() => setShowPostJob(!showPostJob)}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-2xl transition-all mb-6 text-lg"
        >
          {showPostJob ? "✕ Cancel" : "➕ Post New Job Request"}
        </button>

        {submitted && (
          <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-xl p-4 mb-6 text-center">
            <p className="text-green-400 font-bold">✅ Request submitted successfully!</p>
          </div>
        )}

        {/* POST JOB FORM - HIDDEN BY DEFAULT */}
        {showPostJob && (
          <div className="bg-gray-900 border border-yellow-500 rounded-2xl p-8 mb-6">
            <h3 className="text-yellow-400 font-bold text-lg mb-6">🛠️ Post a Job Request</h3>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <label className="block text-gray-400 text-sm mb-2">Describe your problem</label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g. My inverter is not charging, need urgent help"
              className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 resize-none outline-none mb-6"
              rows={3}
            />

            <label className="block text-gray-400 text-sm mb-2">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Port Harcourt, Rivers State"
              className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none mb-6"
            />

            <label className="block text-gray-400 text-sm mb-2">Job Type</label>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setJobType("standard")}
                className={`p-4 rounded-xl text-left transition-all border-2 ${
                  jobType === "standard"
                    ? "bg-yellow-500 text-black border-yellow-500"
                    : "bg-gray-950 border-gray-700 text-gray-400"
                }`}
              >
                <div className="text-2xl mb-1">🔧</div>
                <div className="font-bold text-sm">Standard Job</div>
                <div className={`text-xs mt-1 ${jobType === "standard" ? "text-black" : "text-gray-500"}`}>
                  Everyday repairs and installations
                </div>
              </button>

              <button
                onClick={() => setJobType("contract")}
                className={`p-4 rounded-xl text-left transition-all border-2 ${
                  jobType === "contract"
                    ? "bg-yellow-500 text-black border-yellow-500"
                    : "bg-gray-950 border-gray-700 text-gray-400"
                }`}
              >
                <div className="text-2xl mb-1">📋</div>
                <div className="font-bold text-sm">Contract Job</div>
                <div className={`text-xs mt-1 ${jobType === "contract" ? "text-black" : "text-gray-500"}`}>
                  Complex projects requiring certified professionals
                </div>
              </button>
            </div>

            <label className="block text-gray-400 text-sm mb-2">Urgency</label>
            <div className="flex gap-3 mb-8">
              {["normal", "urgent", "emergency"].map((level) => (
                <button
                  key={level}
                  onClick={() => setUrgency(level)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    urgency === level
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-950 border border-gray-700 text-gray-400"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            <button
              onClick={submitRequest}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-all"
            >
              Submit Request
            </button>
          </div>
        )}

        {/* MY REQUESTS */}
        <MyRequests clientId={user.id} refreshKey={refreshKey} />

      </div>
    </main>
  );
}