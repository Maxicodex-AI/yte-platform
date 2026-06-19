"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

type JobRequest = {
  client_id: string;
  client_name: string;
  problem: string;
  location: string;
  urgency: string;
  status: string;
  job_type: string;
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

    let query = supabase
      .from("job_requests")
      .select("*")
      .eq("status", "pending");

    // Technicians only see standard jobs
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

  const urgencyColor = (urgency: string) => {
    if (urgency === "emergency") return "text-red-400 border-red-400";
    if (urgency === "urgent") return "text-yellow-400 border-yellow-400";
    return "text-green-400 border-green-400";
  };

  const acceptJob = async (client_id: string) => {
    const { error } = await supabase
      .from("job_requests")
      .update({ status: "accepted" })
      .eq("client_id", client_id);

    if (error) {
      console.error(error);
    } else {
      fetchRequests();
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
      <h3 className="text-lg font-bold text-white mb-2">📋 Job Requests</h3>
      <p className="text-gray-500 text-xs mb-6">
        {user?.unsafeMetadata?.role === "engineer"
          ? "You can see all jobs including contracts."
          : "You can see standard jobs only."}
      </p>

      {loading && <p className="text-gray-500 text-sm text-center">Loading requests...</p>}

      {!loading && requests.length === 0 && (
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
              </div>
              <span className={`text-xs border px-2 py-1 rounded-full capitalize ${urgencyColor(req.urgency)}`}>
                {req.urgency}
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-2">🔧 {req.problem}</p>
            <p className="text-gray-500 text-xs">📍 {req.location}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-gray-600 capitalize">Status: {req.status}</span>
              <button
                onClick={() => acceptJob(req.client_id)}
                className="bg-green-500 hover:bg-green-400 text-black text-xs font-bold px-4 py-2 rounded-lg transition-all"
              >
                Accept Job
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}