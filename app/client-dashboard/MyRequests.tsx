"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { notify } from "@/lib/notify";
import { calculateDistance, formatDistance } from "@/lib/distance";
import RateProvider from "./RateProvider";

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
  rating: number;
  review: string;
  rated: boolean;
  client_latitude: number;
  client_longitude: number;
  workspace_id: number | null;
};

type Provider = {
  clerk_id: string;
  full_name: string;
  email: string;
  photo_url: string;
  role: string;
  skills: string;
  location: string;
  rating: number;
  verified: boolean;
  available: boolean;
  latitude: number;
  longitude: number;
};

export default function MyRequests({ clientId, refreshKey }: { clientId: string, refreshKey: number }) {
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [providers, setProviders] = useState<Record<string, Provider>>({});
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    fetchMyRequests();
  }, [refreshKey]);

  const fetchMyRequests = async () => {
    const { data, error } = await supabase
      .from("job_requests")
      .select("*")
      .eq("client_id", clientId)
      .order("client_id", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setRequests(data || []);
      const allProviderIds = (data || [])
        .flatMap((r: JobRequest) => r.interested_providers || []);

      const assignedIds = (data || [])
        .map((r: JobRequest) => r.assigned_to)
        .filter(Boolean) as string[];

      const allIds = [...allProviderIds, ...assignedIds];
      if (allIds.length > 0) {
        fetchProviders(allIds);
      }
    }
    setLoading(false);
  };

  const fetchProviders = async (providerIds: string[]) => {
    const uniqueIds = [...new Set(providerIds)];
    const { data, error } = await supabase
      .from("providers")
      .select("*")
      .in("clerk_id", uniqueIds);

    if (error) {
      console.error(error);
    } else {
      const providerMap: Record<string, Provider> = {};
      (data || []).forEach((p: Provider) => {
        providerMap[p.clerk_id] = p;
      });
      setProviders(providerMap);
    }
  };

  const assignProvider = async (jobId: string, providerId: string, problem: string, providerName: string) => {
  const { error } = await supabase
    .from("job_requests")
    .update({
      assigned_to: providerId,
      status: "in_progress",
    })
    .eq("id", jobId);

  if (error) {
    console.error(error);
    return;
  }

  // Create project workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({
      job_id: jobId,
      client_id: clientId,
      provider_id: providerId,
      client_name: requests.find(r => r.id === jobId)?.client_name || "Client",
      provider_name: providerName,
      problem,
      status: "active",
      milestones: [],
      cost_breakdown: [],
    })
    .select()
    .single();

  if (workspaceError) {
    console.log("Workspace error:", workspaceError);
  } else if (workspace) {
    // Save workspace ID back to job request
    await supabase
      .from("job_requests")
      .update({ workspace_id: workspace.id })
      .eq("id", jobId);

    await notify(
      providerId,
      "🎉 You got hired!",
      `A client has chosen you for the job: "${problem}". Your project workspace is ready!`,
      "hired"
    );

    await notify(
      clientId,
      "🚀 Project Workspace Created!",
      `Your project workspace for "${problem}" is ready. Chat with your provider and track progress!`,
      "workspace"
    );
  }

  fetchMyRequests();
};

  const markCompleted = async (jobId: string, providerId: string | null) => {
    const { error } = await supabase
      .from("job_requests")
      .update({ status: "completed" })
      .eq("id", jobId);

    if (error) {
      console.error(error);
    } else {
      if (providerId) {
        await notify(
          providerId,
          "✅ Job Marked Complete!",
          "The client has marked your job as completed. Please wait for their rating.",
          "completed"
        );
      }
      fetchMyRequests();
    }
  };

  const statusColor = (status: string) => {
    if (status === "in_progress") return "text-blue-400 border-blue-400";
    if (status === "completed") return "text-green-400 border-green-400";
    return "text-gray-400 border-gray-400";
  };

  const urgencyColor = (urgency: string) => {
    if (urgency === "emergency") return "text-red-400";
    if (urgency === "urgent") return "text-yellow-400";
    return "text-gray-400";
  };

  const activeCount = requests.filter(r => r.status === "pending" || r.status === "in_progress").length;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

      {/* HEADER - CLICKABLE */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex justify-between items-center"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white">📋 My Requests</h3>
          {activeCount > 0 && (
            <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">
              {activeCount} active
            </span>
          )}
          {requests.length > 0 && (
            <span className="text-xs text-gray-500">
              ({requests.length} total)
            </span>
          )}
        </div>
        <span className="text-gray-500 text-sm">
          {collapsed ? "▶ View" : "▼ Hide"}
        </span>
      </button>

      {/* CONTENT */}
      {!collapsed && (
        <div className="mt-6">
          {loading && (
            <p className="text-gray-500 text-sm text-center">Loading your requests...</p>
          )}

          {!loading && requests.length === 0 && (
            <p className="text-gray-500 text-sm text-center">
              You haven&apos;t submitted any requests yet.
            </p>
          )}

          <div className="flex flex-col gap-4">
            {requests.map((req, i) => (
              <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs border px-2 py-1 rounded-full capitalize ${statusColor(req.status)}`}>
                      {req.status.replace("_", " ")}
                    </span>
                    {req.job_type === "contract" && (
                      <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                        Contract
                      </span>
                    )}
                  </div>
                  <span className={`text-xs capitalize font-medium ${urgencyColor(req.urgency)}`}>
                    {req.urgency}
                  </span>
                </div>

                <p className="text-gray-300 text-sm mb-2">🔧 {req.problem}</p>
                <p className="text-gray-500 text-xs mb-4">📍 {req.location}</p>

                {/* INTERESTED PROVIDERS */}
                {req.status === "pending" && (
                  <div className="mt-3">
                    {(req.interested_providers || []).length === 0 ? (
                      <p className="text-gray-600 text-xs">
                        ⏳ Waiting for providers to express interest...
                      </p>
                    ) : (
                      <div>
                        <p className="text-gray-400 text-xs mb-3">
                          👥 {req.interested_providers.length} provider(s) interested — pick one:
                        </p>
                        <div className="flex flex-col gap-3">
                          {req.interested_providers.map((providerId, j) => {
                            const provider = providers[providerId];
                            return (
                              <div key={j} className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                                {provider ? (
                                  <>
                                    <div className="flex items-center gap-3 mb-3">
                                      {provider.photo_url && (
                                        <img
                                          src={provider.photo_url}
                                          alt={provider.full_name}
                                          className="w-10 h-10 rounded-full border-2 border-yellow-500"
                                        />
                                      )}
                                      <div>
                                        <p className="text-white font-bold text-sm">
                                          {provider.full_name || "Provider"}
                                          {provider.verified && (
                                            <span className="ml-2 text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold">
                                              ✓ Verified
                                            </span>
                                          )}
                                        </p>
                                        <p className="text-gray-400 text-xs capitalize">
                                          {provider.role} • ⭐ {provider.rating || 0} rating
                                        </p>
                                      </div>
                                    </div>
                                    {provider.skills && (
                                      <p className="text-gray-400 text-xs mb-1">
                                        🛠️ {provider.skills}
                                      </p>
                                    )}
                                    {provider.location && (
                                      <p className="text-gray-500 text-xs">
                                        📍 {provider.location}
                                      </p>
                                    )}
                                    {provider.latitude && req.client_latitude ? (
                                      <p className="text-yellow-400 text-xs font-bold mb-3">
                                        📡 {formatDistance(calculateDistance(
                                          req.client_latitude,
                                          req.client_longitude,
                                          provider.latitude,
                                          provider.longitude
                                        ))}
                                      </p>
                                    ) : (
                                      <p className="text-gray-600 text-xs mb-3">
                                        📡 Distance unavailable
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-gray-500 text-xs mb-3">
                                    Loading provider info...
                                  </p>
                                )}
                                <button
                                  onClick={() => assignProvider(req.id, providerId, req.problem, provider?.full_name || "Provider")}
                                  className="w-full text-xs bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-3 py-2 rounded-lg transition-all"
                                >
                                  ⚡ Hire This Provider
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* IN PROGRESS */}
{req.status === "in_progress" && (
  <div className="mt-3">
    <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-3 mb-3">
      <p className="text-blue-400 text-xs">
        🔧 A provider is currently working on this job.
      </p>
    </div>

    
      {req.workspace_id ? (
  <a
    href={`/workspace/${req.workspace_id}`}
    className="w-full text-xs bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-3 py-2 rounded-lg transition-all flex items-center justify-center mb-2"
  >
    🚀 Open Project Workspace
  </a>
) : (
  <p className="text-gray-500 text-xs text-center mb-2">⏳ Setting up workspace...</p>
)}

    <button
      onClick={() => markCompleted(req.id, req.assigned_to)}
      className="w-full text-xs bg-green-500 hover:bg-green-400 text-black font-bold px-3 py-2 rounded-lg transition-all"
    >
      ✅ Mark as Completed
    </button>
  </div>
)}
                {/* COMPLETED - SHOW RATING */}
                {req.status === "completed" && (
                  <div className="mt-3">
                    <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-3 mb-3">
                      <p className="text-green-400 text-xs font-bold">
                        ✅ Job Completed!
                      </p>
                    </div>
                    {req.rated ? (
                      <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-lg p-3">
                        <p className="text-yellow-400 text-xs font-bold">
                          ⭐ You rated this job {req.rating}/5
                        </p>
                        {req.review && (
                          <p className="text-gray-400 text-xs mt-1">&quot;{req.review}&quot;</p>
                        )}
                      </div>
                    ) : (
                      req.assigned_to && (
                        <RateProvider
                          jobId={req.id}
                          providerId={req.assigned_to}
                          providerName={providers[req.assigned_to]?.full_name || "Provider"}
                          onRated={fetchMyRequests}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}