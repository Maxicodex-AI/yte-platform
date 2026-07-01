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

  useEffect(() => {
    setError("");
  }, []);

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
        <a href="/" className="text-green-400 hover:underline">← Back to Home</a>
      </main>
    );
  }

  const submitRequest = async () => {
    if (!problem.trim() || !location.trim()) {
      setError("Please fill in both the problem and location fields.");
      return;
    }
    setError("");

    const { error: dbError } = await supabase.from("job_requests").insert({
      client_id: user.id,
      client_name: user.fullName || "Client",
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
        <div className="flex justify-between items-center mb-12">
          <a href="/" className="text-green-400 font-bold text-lg">⚡ YTE</a>
          <a href="/" className="text-gray-400 hover:text-green-400 text-sm">← Back to Home</a>
        </div>

        <h1 className="text-3xl font-extrabold text-green-400 mb-2">Client Dashboard</h1>
        <p className="text-gray-400 mb-10">Need help? Tell us your problem and we&apos;ll connect you to a technician.</p>

        {/* PROFILE */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 flex items-center gap-4">
          <img
            src={user.imageUrl}
            alt="Profile"
            className="w-14 h-14 rounded-full border-2 border-green-500"
          />
          <div>
            <h2 className="text-lg font-bold text-white">{user.fullName || "Client"}</h2>
            <p className="text-gray-400 text-sm">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>

        {/* JOB REQUEST FORM */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-6">
          <h3 className="text-lg font-bold text-white mb-6">🛠️ Request Help</h3>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <label className="block text-gray-400 text-sm mb-2">Describe your problem</label>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g. My inverter is not charging, need urgent help"
            className="w-full bg-gray-950 border border-gray-700 focus:border-green-500 rounded-xl p-4 text-white placeholder-gray-500 resize-none outline-none mb-6"
            rows={3}
          />

          <label className="block text-gray-400 text-sm mb-2">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Port Harcourt, Rivers State"
            className="w-full bg-gray-950 border border-gray-700 focus:border-green-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none mb-6"
          />

          <label className="block text-gray-400 text-sm mb-2">Job Type</label>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setJobType("standard")}
              className={`p-4 rounded-xl text-left transition-all border-2 ${
                jobType === "standard"
                  ? "bg-green-500 text-black border-green-500"
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
                  ? "bg-green-500 text-black border-green-500"
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
                    ? "bg-green-500 text-black"
                    : "bg-gray-950 border border-gray-700 text-gray-400"
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <button
            onClick={submitRequest}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition-all"
          >
            {submitted ? "✓ Request Sent!" : "Submit Request"}
          </button>
        </div>

        {/* MY REQUESTS */}
        <MyRequests clientId={user.id} refreshKey={refreshKey} />

      </div>
    </main>
  );
}