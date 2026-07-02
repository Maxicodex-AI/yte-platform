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
  interested_providers: string[];
  assigned_to: string | null;
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
};

export default function MyRequests({ clientId, refreshKey }: { clientId: string, refreshKey: number }) {
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [providers, setProviders] = useState<Record<string, Provider>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRequests();
  }, [refreshKey]);

  const fetchMyRequests = async () => {
    const { data, error } = await supabase
      .from("job_requests")
      .select("*")
      .eq("client_id", clientId)
      .neq("status", "completed")
      .order("client_id", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setRequests(data || []);
      const allProviderIds = (data || [])
        .flatMap((r: JobRequest) => r.interested_providers || []);
      
      if (allProviderIds.length > 0) {
        fetchProviders(allProviderIds);
      }
    }
    setLoading(false);
  };

  const fetchProviders = async (providerIds: string[]) => {
    const { data, error } = await supabase
      .from("providers")
      .select("*")
      .in("clerk_id", providerIds);

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

  const assignProvider = async (jobId: string, providerId: string) => {
    const { error } = await supabase
      .from("job_requests")
      .update({
        assigned_to: providerId,
        status: "in_progress",
      })
      .eq("id", jobId);

    if (error) {
      console.error(error);
    } else {
      fetchMyRequests();
    }
  };

  const statusColor = (status: string) => {
    if (status === "in_progress") return "text-blue-400 border-blue-400";
    if (status === "completed") return "text-yellow-400 border-yellow-400";
    return "text-gray-400 border-gray-400";
  };

  const urgencyColor = (urgency: string) => {
    if (urgency === "emergency") return "text-red-400";
    if (urgency === "urgent") return "text-yellow-400";
    return "text-gray-400";
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
      <h3 className="text-lg font-bold text-white mb-6">📋 My Requests</h3>

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
                                  <p className="text-gray-400 text-xs mb-2">
                                    🛠️ {provider.skills}
                                  </p>
                                )}
                                {provider.location && (
                                  <p className="text-gray-500 text-xs mb-3">
                                    📍 {provider.location}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-gray-500 text-xs mb-3">
                                Loading provider info...
                              </p>
                            )}
                            <button
                              onClick={() => assignProvider(req.id, providerId)}
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

            {req.status === "in_progress" && (
              <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-3 mt-2">
                <p className="text-blue-400 text-xs">
                  🔧 A provider is currently working on this job.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}