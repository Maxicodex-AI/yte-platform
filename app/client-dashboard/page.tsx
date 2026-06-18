"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function ClientDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [problem, setProblem] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [location, setLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);

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

  const submitRequest = () => {
    if (!problem.trim() || !location.trim()) return;
    // Placeholder: will save to database once Supabase is connected
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setProblem("");
      setLocation("");
      setUrgency("normal");
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

        {/* MY REQUESTS PLACEHOLDER */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-bold text-white mb-2">📋 My Requests</h3>
          <p className="text-gray-500 text-sm">No requests yet. Once you submit one, it will appear here.</p>
        </div>

      </div>
    </main>
  );
}