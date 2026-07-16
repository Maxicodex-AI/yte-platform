"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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

export default function AcceptedJobs({ providerId }: { providerId: string }) {
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    fetchAcceptedJobs();
  }, []);

  const fetchAcceptedJobs = async () => {
    const { data, error } = await supabase
      .from("job_requests")
      .select("*")
      .eq("status", "in_progress")
      .eq("assigned_to", providerId);

    if (error) {
      console.error(error);
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  };

  const markCompleted = async (id: string) => {
    const { error } = await supabase
      .from("job_requests")
      .update({ status: "completed" })
      .eq("id", id);

    if (error) {
      console.error(error);
    } else {
      fetchAcceptedJobs();
    }
  };

  const urgencyColor = (urgency: string) => {
    if (urgency === "emergency") return "text-red-400 border-red-400";
    if (urgency === "urgent") return "text-yellow-400 border-yellow-400";
    return "text-green-400 border-green-400";
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mt-6">

      {/* HEADER - CLICKABLE */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex justify-between items-center"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white">✅ My Active Jobs</h3>
          {jobs.length > 0 && (
            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">
              {jobs.length} active
            </span>
          )}
        </div>
        <span className="text-gray-500 text-sm">
          {collapsed ? "▶ View" : "▼ Hide"}
        </span>
      </button>

      {/* CONTENT */}
      {!collapsed && (
        <div className="mt-4">
          <p className="text-gray-500 text-xs mb-4">Jobs you have accepted and are working on.</p>

          {loading && (
            <p className="text-gray-500 text-sm text-center">Loading your jobs...</p>
          )}

          {!loading && jobs.length === 0 && (
            <p className="text-gray-500 text-sm text-center">No active jobs yet.</p>
          )}

          <div className="flex flex-col gap-4">
            {jobs.map((job, i) => (
              <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-semibold">{job.client_name}</h4>
                    {job.job_type === "contract" && (
                      <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                        Contract
                      </span>
                    )}
                  </div>
                  <span className={`text-xs border px-2 py-1 rounded-full capitalize ${urgencyColor(job.urgency)}`}>
                    {job.urgency}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-2">🔧 {job.problem}</p>
                <p className="text-gray-500 text-xs mb-4">📍 {job.location}</p>
                <a
  href={`/workspace/${job.id}`}
  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold py-2 rounded-lg transition-all flex items-center justify-center mb-2"
>
  🚀 Open Project Workspace
</a>

<button
  onClick={() => markCompleted(job.id)}
  className="w-full bg-green-500 hover:bg-green-400 text-white text-sm font-bold py-2 rounded-lg transition-all"
>
  ✓ Mark as Completed
</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}