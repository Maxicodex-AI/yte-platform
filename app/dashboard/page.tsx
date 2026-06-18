"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [skills, setSkills] = useState("");
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      const meta = user.unsafeMetadata;
      setSkills((meta?.skills as string) || "");
      setAvailable(meta?.available !== false);
    }
  }, [isLoaded, user]);

  if (!isLoaded) return null;

  if (!user) {
    router.push("/");
    return null;
  }

  const role = user.unsafeMetadata?.role as string | undefined;

  if (role !== "provider") {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
        <p className="text-gray-400 mb-4">This dashboard is for Technicians/Engineers only.</p>
        <a href="/" className="text-green-400 hover:underline">← Back to Home</a>
      </main>
    );
  }

  const saveProfile = async () => {
    setSaving(true);
    try {
      await user.update({
        unsafeMetadata: { ...user.unsafeMetadata, skills, available },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        
        {/* NAV */}
        <div className="flex justify-between items-center mb-12">
          <a href="/" className="text-green-400 font-bold text-lg">⚡ YTE</a>
          <a href="/" className="text-gray-400 hover:text-green-400 text-sm">← Back to Home</a>
        </div>

        <h1 className="text-3xl font-extrabold text-green-400 mb-2">Provider Dashboard</h1>
        <p className="text-gray-400 mb-10">Manage your profile and availability.</p>

        {/* PROFILE CARD */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-8">
            <img
              src={user.imageUrl}
              alt="Profile"
              className="w-16 h-16 rounded-full border-2 border-green-500"
            />
            <div>
              <h2 className="text-xl font-bold text-white">{user.fullName || "Provider"}</h2>
              <p className="text-gray-400 text-sm">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>

          <label className="block text-gray-400 text-sm mb-2">Your Skills</label>
          <textarea
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. Electrical wiring, Solar installation, Borehole repair"
            className="w-full bg-gray-950 border border-gray-700 focus:border-green-500 rounded-xl p-4 text-white placeholder-gray-500 resize-none outline-none mb-6"
            rows={3}
          />

          <div className="flex items-center justify-between mb-6">
            <span className="text-gray-400 text-sm">Available for jobs</span>
            <button
              onClick={() => setAvailable(!available)}
              className={`w-14 h-7 rounded-full transition-all relative ${
                available ? "bg-green-500" : "bg-gray-700"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${
                  available ? "left-8" : "left-1"
                }`}
              />
            </button>
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-700 text-black font-bold py-3 rounded-xl transition-all"
          >
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Profile"}
          </button>
        </div>

        {/* JOB REQUESTS PLACEHOLDER */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-bold text-white mb-2">📋 Job Requests</h3>
          <p className="text-gray-500 text-sm">No job requests yet. This feature is coming soon!</p>
        </div>

      </div>
    </main>
  );
}