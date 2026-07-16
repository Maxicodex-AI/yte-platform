"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Provider = {
  clerk_id: string;
  full_name: string;
  email: string;
  photo_url: string;
  cover_url: string;
  role: string;
  skills: string;
  location: string;
  rating: number;
  verified: boolean;
  available: boolean;
  bio: string;
  years_experience: number;
  service_coverage: string;
  certifications: string;
  linkedin_url: string;
  portfolio_url: string;
  response_time: string;
  completion_rate: number;
  total_earned: number;
  skill_levels: Record<string, number>;
  availability_days: string[];
};

type Review = {
  id: number;
  client_name: string;
  rating: number;
  review: string;
  created_at: string;
};

export default function ProviderProfile() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const providerId = params.id as string;

  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [jobsCompleted, setJobsCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProvider();
    fetchReviews();
    fetchJobsCompleted();
  }, [providerId]);

  const fetchProvider = async () => {
    const { data, error } = await supabase
      .from("providers")
      .select("*")
      .eq("clerk_id", providerId)
      .single();

    if (error) {
      console.error(error);
    } else {
      setProvider(data);
    }
    setLoading(false);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("job_requests")
      .select("rating, review, client_name, created_at")
      .eq("assigned_to", providerId)
      .eq("rated", true)
      .order("created_at", { ascending: false });

    setReviews((data as Review[]) || []);
  };

  const fetchJobsCompleted = async () => {
    const { data } = await supabase
      .from("job_requests")
      .select("id")
      .eq("assigned_to", providerId)
      .eq("status", "completed");

    setJobsCompleted(data?.length || 0);
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-yellow-400 animate-pulse">⚡ Loading profile...</p>
      </main>
    );
  }

  if (!provider) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Provider not found.</p>
      </main>
    );
  }

  const skills = provider.skills?.split(",").map(s => s.trim()).filter(Boolean) || [];
  const certifications = provider.certifications?.split(",").map(c => c.trim()).filter(Boolean) || [];
  const isOwnProfile = user?.id === providerId;

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* NAV */}
      <nav className="bg-black border-b-2 border-yellow-500 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <a href="/">
          <img src="/images/yte-icon.png" alt="YTE" className="h-12 w-auto" />
        </a>
        <div className="flex items-center gap-3">
          <button
            onClick={copyProfileLink}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg transition-all"
          >
            {copied ? "✓ Copied!" : "🔗 Share Profile"}
          </button>
          <a href="/" className="text-gray-400 hover:text-yellow-400 text-sm">← Back</a>
        </div>
      </nav>

      {/* COVER PHOTO */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-gray-900 via-yellow-900 to-black overflow-hidden">
        {provider.cover_url ? (
          <img src={provider.cover_url} alt="Cover" className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 opacity-10">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-yellow-400 text-4xl"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: Math.random(),
                  }}
                >
                  ⚡
                </div>
              ))}
            </div>
            <p className="text-yellow-900 text-6xl font-extrabold opacity-20">YTE</p>
          </div>
        )}

        {/* PROFILE PHOTO */}
        <div className="absolute -bottom-12 left-6 md:left-10">
          {provider.photo_url ? (
            <img
              src={provider.photo_url}
              alt={provider.full_name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-yellow-500 object-cover shadow-2xl"
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-yellow-500 bg-gray-800 flex items-center justify-center shadow-2xl">
              <span className="text-yellow-400 font-extrabold text-4xl">
                {(provider.full_name || "P")[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* PROFILE INFO */}
      <div className="px-6 md:px-10 pt-16 pb-6 bg-gray-900 border-b border-gray-800">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                {provider.full_name || "Provider"}
              </h1>
              {provider.verified && (
                <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">
                  ✅ YTE Verified
                </span>
              )}
              {provider.rating >= 4.5 && jobsCompleted >= 5 && (
                <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full font-bold">
                  🏆 Top Provider
                </span>
              )}
            </div>
            <p className="text-yellow-400 font-semibold capitalize mt-1">
              {provider.role === "engineer" ? "👷 Certified Engineer" : "🛠️ Professional Technician"}
            </p>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="text-gray-400 text-sm">⭐ {provider.rating || 0} rating</span>
              <span className="text-gray-400 text-sm">✅ {jobsCompleted} jobs completed</span>
              {provider.location && <span className="text-gray-400 text-sm">📍 {provider.location}</span>}
              {provider.years_experience > 0 && (
                <span className="text-gray-400 text-sm">🕐 {provider.years_experience} years exp.</span>
              )}
            </div>
            {provider.bio && (
              <p className="text-gray-300 text-sm mt-3 max-w-2xl italic">
                &quot;{provider.bio}&quot;
              </p>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 flex-wrap">
            {isOwnProfile ? (
              <a
                href="/dashboard"
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl transition-all text-sm"
              >
                ⚙️ Edit Profile
              </a>
            ) : (
              <>
                <a
                  href="/client-dashboard"
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl transition-all text-sm"
                >
                  ⚡ Hire Me
                </a>
                {provider.linkedin_url && (
                  <a
                    href={provider.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-bold px-4 py-3 rounded-xl transition-all text-sm"
                  >
                    LinkedIn
                  </a>
                )}
              </>
            )}
            <button
              onClick={copyProfileLink}
              className="border border-gray-700 text-gray-400 hover:border-yellow-500 hover:text-yellow-400 font-bold px-4 py-3 rounded-xl transition-all text-sm"
            >
              🔗 Share
            </button>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="bg-black border-b border-gray-800 px-6 md:px-10 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
          {[
            { label: "Jobs Completed", value: jobsCompleted, icon: "✅" },
            { label: "Average Rating", value: `${provider.rating || 0}⭐`, icon: "🏆" },
            { label: "Completion Rate", value: `${provider.completion_rate || 100}%`, icon: "📊" },
            { label: "Response Time", value: provider.response_time || "Fast", icon: "⚡" },
          ].map((stat, i) => (
            <div key={i} className="text-center bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-extrabold text-yellow-400">{stat.value}</div>
              <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 md:px-10">
        <div className="flex gap-1 overflow-x-auto">
          {["overview", "skills", "availability", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-bold capitalize whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab === "overview" && "📋 Overview"}
              {tab === "skills" && "🛠️ Skills"}
              {tab === "availability" && "📅 Availability"}
              {tab === "reviews" && `⭐ Reviews (${reviews.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10 py-8">

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">

            {/* ABOUT */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-yellow-400 font-bold mb-4">👤 About</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {provider.location && (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="text-gray-400 text-xs">Location</p>
                      <p className="text-white text-sm font-semibold">{provider.location}</p>
                    </div>
                  </div>
                )}
                {provider.service_coverage && (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌍</span>
                    <div>
                      <p className="text-gray-400 text-xs">Service Coverage</p>
                      <p className="text-white text-sm font-semibold">{provider.service_coverage}</p>
                    </div>
                  </div>
                )}
                {provider.years_experience > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🕐</span>
                    <div>
                      <p className="text-gray-400 text-xs">Experience</p>
                      <p className="text-white text-sm font-semibold">{provider.years_experience} years</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{provider.available ? "🟢" : "🔴"}</span>
                  <div>
                    <p className="text-gray-400 text-xs">Status</p>
                    <p className={`text-sm font-semibold ${provider.available ? "text-green-400" : "text-red-400"}`}>
                      {provider.available ? "Available for Jobs" : "Currently Unavailable"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CERTIFICATIONS */}
            {certifications.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-yellow-400 font-bold mb-4">🏅 Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert, i) => (
                    <span
                      key={i}
                      className="bg-yellow-500 bg-opacity-10 border border-yellow-500 text-yellow-400 text-xs px-3 py-2 rounded-full font-bold"
                    >
                      🎖️ {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* PROFESSIONAL LINKS */}
            {(provider.linkedin_url || provider.portfolio_url) && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-yellow-400 font-bold mb-4">🔗 Professional Links</h3>
                <div className="flex gap-3 flex-wrap">
                  {provider.linkedin_url && (
                    <a
                      href={provider.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-500 bg-opacity-10 border border-blue-500 text-blue-400 px-4 py-2 rounded-xl text-sm hover:bg-blue-500 hover:text-white transition-all"
                    >
                      LinkedIn Profile →
                    </a>
                  )}
                  {provider.portfolio_url && (
                    <a
                      href={provider.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-purple-500 bg-opacity-10 border border-purple-500 text-purple-400 px-4 py-2 rounded-xl text-sm hover:bg-purple-500 hover:text-white transition-all"
                    >
                      Portfolio →
                    </a>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === "skills" && (
          <div className="flex flex-col gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-yellow-400 font-bold mb-6">🛠️ Skills</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-3 py-2 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* SKILL LEVELS */}
              {Object.keys(provider.skill_levels || {}).length > 0 && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-gray-400 text-sm font-bold">Skill Proficiency</h4>
                  {Object.entries(provider.skill_levels || {}).map(([skill, level], i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white">{skill}</span>
                        <span className="text-yellow-400">{level}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all"
                          style={{ width: `${level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AVAILABILITY TAB */}
        {activeTab === "availability" && (
          <div className="flex flex-col gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-yellow-400 font-bold mb-6">📅 Weekly Availability</h3>
              <div className="grid grid-cols-7 gap-2 mb-6">
                {days.map((day, i) => {
                  const isAvailable = provider.availability_days?.includes(day);
                  return (
                    <div
                      key={i}
                      className={`text-center py-3 rounded-xl text-xs font-bold ${
                        isAvailable
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-800 text-gray-600"
                      }`}
                    >
                      <p>{day}</p>
                      <p className="mt-1">{isAvailable ? "✓" : "✗"}</p>
                    </div>
                  );
                })}
              </div>
              <div className={`p-4 rounded-xl border ${
                provider.available
                  ? "bg-green-500 bg-opacity-10 border-green-500"
                  : "bg-red-500 bg-opacity-10 border-red-500"
              }`}>
                <p className={`text-sm font-bold text-center ${
                  provider.available ? "text-green-400" : "text-red-400"
                }`}>
                  {provider.available
                    ? "🟢 Currently available for new jobs"
                    : "🔴 Not available for new jobs right now"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="flex flex-col gap-4">
            {reviews.length === 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                <p className="text-gray-500">No reviews yet.</p>
              </div>
            )}
            {reviews.map((review, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-white font-bold">{review.client_name || "Client"}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= review.rating ? "text-yellow-400" : "text-gray-700"}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                {review.review && (
                  <p className="text-gray-300 text-sm italic">
                    &quot;{review.review}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}