"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
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
  interested_providers: string[];
  assigned_to: string | null;
};

export default function JobRequests() {
  const { user, isLoaded } = useUser();
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchRequests();
    }
  }, [isLoaded, user]);

  const fetchRequests = async () => {
    const role = user?.unsafeMetadata?.role as string;
    const available = user?.unsafeMetadata?.available;

    // If provider is unavailable, show no jobs
    if (available === false) {
      setRequests([]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from("job_requests")
      .select("*")
      .in("status", ["pending", "in_progress"]);

    if (role === "technician") {
      query = query.eq("job_type", "standard");
    }

    const { data, error } = await query.order("client_id", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const expressInterest = async (job: JobRequest) => {
    const currentProviders = job.interested_providers || [];
    
    // Check if already interested
    if (currentProviders.includes(user?.id || "")) {
      return;
    }

    const updatedProviders = [...currentProviders, user?.id || ""];

    const { error } = await supabase
      .from("job_requests")
      .update({ interested_providers: updatedProviders })
      .eq("id", job.id);

    if (error) {
      console.error(error);
    } else {
      fetchRequests();
    }
  };

  const urgencyColor = (urgency: string) => {
    if (urgency === "emergency") return "text-red-400 border-red-400";
    if (urgency === "urgent") return "text-yellow-400 border-yellow-400";
    return "text-green-400 border-green-400";
  };

  const isInterested = (job: JobRequest) => {
    return (job.interested_providers || []).includes(user?.id || "");
  };

  const available = user?.unsafeMetadata?.available;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
      <h3 className="text-lg font-bold text-white mb-2">📋 Job Requests</h3>
      <p className="text-gray-500 text-xs mb-2">
        {user?.unsafeMetadata?.role === "engineer"
          ? "You can see all jobs including contracts."
          : "You can see standard jobs only."}
      </p>

      {available === false && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-xl p-4 mb-4">
          <p className="text-red-400 text-sm">
            🔴 You are currently unavailable. Turn on availability in your profile to see jobs.
          </p>
        </div>
      )}

      {loading && <p className="text-gray-500 text-sm text-center">Loading requests...</p>}

      {!loading && requests.length === 0 && available !== false && (
        <p className="text-gray-500 text-sm text-center">No job requests available right now.</p>
      )}

      <div className="flex flex-col gap-4">
        {requests.map((req, i) => (
          <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-white font-semibold">{req.client_name}</h4>
                {req.job_type === "contract" && (
                  <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                    Contract
                  </span>
                )}
                {req.status === "in_progress" && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    In Progress
                  </span>
                )}
              </div>
              <span className={`text-xs border px-2 py-1 rounded-full capitalize ${urgencyColor(req.urgency)}`}>
                {req.urgency}
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-2">🔧 {req.problem}</p>
            <p className="text-gray-500 text-xs mb-3">📍 {req.location}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-600">
                👥 {(req.interested_providers || []).length} interested
              </span>
              {req.status === "pending" && (
                <button
                  onClick={() => expressInterest(req)}
                  disabled={isInterested(req)}
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                    isInterested(req)
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-400 text-black"
                  }`}
                >
                  {isInterested(req) ? "✓ Interested" : "I'm Interested"}
                </button>
              )}
              {req.status === "in_progress" && req.assigned_to === user?.id && (
                <span className="text-xs text-blue-400 font-bold">✓ Assigned to you</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}