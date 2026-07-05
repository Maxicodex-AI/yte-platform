"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import JobRequests from "./JobRequests";
import AcceptedJobs from "./AcceptedJobs";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [stats, setStats] = useState({ jobsCompleted: 0, rating: 0, pending: 0 });

  useEffect(() => {
    if (isLoaded && user) {
      const meta = user.unsafeMetadata;
      setFullName(user.fullName || "");
      setSkills((meta?.skills as string) || "");
      setLocation((meta?.location as string) || "");
      setAvailable(meta?.available !== false);

      supabase
        .from("providers")
        .select("photo_url, rating")
        .eq("clerk_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.photo_url) setPhotoUrl(data.photo_url);
          else setPhotoUrl(user.imageUrl || "");
          setStats(prev => ({ ...prev, rating: data?.rating || 0 }));
        });

      supabase
        .from("job_requests")
        .select("*")
        .eq("accepted_by", user.id)
        .eq("status", "completed")
        .then(({ data }) => {
          setStats(prev => ({ ...prev, jobsCompleted: data?.length || 0 }));
        });

      supabase
        .from("job_requests")
        .select("*")
        .eq("status", "pending")
        .then(({ data }) => {
          setStats(prev => ({ ...prev, pending: data?.length || 0 }));
        });
    }
  }, [isLoaded, user]);

  if (!isLoaded) return null;

  if (!user) {
    router.push("/");
    return null;
  }

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
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const newPhotoUrl = data.publicUrl;
      setPhotoUrl(newPhotoUrl);
      await supabase.from("providers").update({ photo_url: newPhotoUrl }).eq("clerk_id", user.id);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await user.update({
        firstName: fullName.split(" ")[0],
        lastName: fullName.split(" ").slice(1).join(" "),
        unsafeMetadata: { ...user.unsafeMetadata, skills, location, available },
      });

      const { data: existing } = await supabase
        .from("providers")
        .select("*")
        .eq("clerk_id", user.id)
        .single();

      if (existing) {
        await supabase.from("providers").update({
          full_name: fullName,
          email: user.primaryEmailAddress?.emailAddress || "",
          photo_url: photoUrl || user.imageUrl || "",
          role: role || "",
          skills,
          location,
          available,
        }).eq("clerk_id", user.id);
      } else {
        await supabase.from("providers").insert({
          clerk_id: user.id,
          full_name: fullName,
          email: user.primaryEmailAddress?.emailAddress || "",
          photo_url: photoUrl || user.imageUrl || "",
          role: role || "",
          skills,
          location,
          available,
          rating: 0,
          verified: false,
        });
      }

      setSaved(true);
      setShowEditProfile(false);
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
                src={photoUrl || user.imageUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full border-2 border-yellow-500 object-cover"
              />
              <div>
                <h1 className="text-xl font-extrabold text-white">
                  👋 Welcome, {fullName.split(" ")[0] || "Provider"}!
                </h1>
                <p className="text-gray-400 text-sm capitalize">
                  {role === "engineer" ? "👷 Certified Engineer" : "🛠️ Technician"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold capitalize">
                    {role}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${available ? "bg-green-500 text-black" : "bg-red-500 text-white"}`}>
                    {available ? "🟢 Available" : "🔴 Unavailable"}
                  </span>
                </div>
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
            { label: "Jobs Done", value: stats.jobsCompleted, icon: "✅" },
            { label: "Rating", value: `${stats.rating || 0}⭐`, icon: "🏆" },
            { label: "New Jobs", value: stats.pending, icon: "📋" },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-extrabold text-yellow-400">{stat.value}</div>
              <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* AVAILABILITY TOGGLE */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-sm">Availability Status</p>
            <p className="text-gray-500 text-xs">
              {available ? "You are visible to clients and receiving jobs" : "You are hidden from clients"}
            </p>
          </div>
          <button
            onClick={() => setAvailable(!available)}
            className={`w-14 h-7 rounded-full transition-all relative ${available ? "bg-yellow-500" : "bg-gray-700"}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${available ? "left-8" : "left-1"}`} />
          </button>
        </div>

        {/* EDIT PROFILE - HIDDEN BY DEFAULT */}
        {showEditProfile && (
          <div className="bg-gray-900 border border-yellow-500 rounded-2xl p-6 mb-6">
            <h3 className="text-yellow-400 font-bold mb-6">⚙️ Edit Profile</h3>

            {/* PHOTO UPLOAD */}
            <label className="block text-gray-400 text-sm mb-2">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-3 text-white outline-none text-sm mb-2"
            />
            {uploading && <p className="text-yellow-400 text-xs mb-4">⚡ Uploading photo...</p>}
            {uploadSuccess && <p className="text-green-400 text-xs mb-4">✅ Photo uploaded!</p>}

            <label className="block text-gray-400 text-sm mb-2">Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none mb-6"
            />

            <label className="block text-gray-400 text-sm mb-2">Your Skills</label>
            <textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Electrical wiring, Solar installation, Borehole repair"
              className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 resize-none outline-none mb-6"
              rows={3}
            />

            <label className="block text-gray-400 text-sm mb-2">Your Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Port Harcourt, Rivers State"
              className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-bold py-3 rounded-xl transition-all"
              >
                {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Profile"}
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

        {/* JOB REQUESTS */}
        <JobRequests />
        <AcceptedJobs providerId={user.id} />

      </div>
    </main>
  );
}