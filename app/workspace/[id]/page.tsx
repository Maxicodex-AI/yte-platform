"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Workspace = {
  id: number;
  job_id: string;
  client_id: string;
  provider_id: string;
  client_name: string;
  provider_name: string;
  problem: string;
  status: string;
  milestones: Milestone[];
  cost_breakdown: CostItem[];
  created_at: string;
  completed_at: string | null;
};

type Message = {
  id: number;
  workspace_id: number;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
};

type Milestone = {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
};

type CostItem = {
  id: string;
  description: string;
  amount: number;
  created_at: string;
};

export default function WorkspacePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.id as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Milestone state
  const [newMilestone, setNewMilestone] = useState("");
  const [addingMilestone, setAddingMilestone] = useState(false);

  // Cost state
  const [newCostDesc, setNewCostDesc] = useState("");
  const [newCostAmount, setNewCostAmount] = useState("");
  const [addingCost, setAddingCost] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchWorkspace();
      fetchMessages();

      // Real-time chat
      const channel = supabase
        .channel(`workspace-${workspaceId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `workspace_id=eq.${workspaceId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isLoaded, user, workspaceId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchWorkspace = async () => {
  // Try by workspace id first
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .maybeSingle();

  if (data) {
    setWorkspace(data);
    setLoading(false);
    return;
  }

  // Fallback: try by job_id
  const { data: data2, error: error2 } = await supabase
    .from("workspaces")
    .select("*")
    .eq("job_id", workspaceId)
    .maybeSingle();

  if (data2) {
    setWorkspace(data2);
  } else {
    console.log("Workspace not found:", error || error2);
    // Don't redirect — show empty workspace instead
    setWorkspace(null);
  }
  setLoading(false);
};

  const fetchMessages = async () => {
    if (!workspace) return;

const { data, error } = await supabase
  .from("messages")
  .select("*")
  .eq("workspace_id", workspace.id)
  .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setMessages(data || []);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !workspace) return;
    setSending(true);

    const role = user.unsafeMetadata?.role as string;
    const isClient = user.id === workspace.client_id;

    await supabase.from("messages").insert({
      workspace_id: parseInt(workspaceId),
      sender_id: user.id,
      sender_name: user.fullName || (isClient ? workspace.client_name : workspace.provider_name),
      sender_role: isClient ? "client" : role,
      message: newMessage,
    });

    setNewMessage("");
    setSending(false);
  };

  const addMilestone = async () => {
    if (!newMilestone.trim() || !workspace) return;
    setAddingMilestone(true);

    const milestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestone,
      completed: false,
      created_at: new Date().toISOString(),
    };

    const updatedMilestones = [...(workspace.milestones || []), milestone];

    await supabase
      .from("workspaces")
      .update({ milestones: updatedMilestones })
      .eq("id", workspaceId);

    setWorkspace({ ...workspace, milestones: updatedMilestones });
    setNewMilestone("");
    setAddingMilestone(false);
  };

  const toggleMilestone = async (milestoneId: string) => {
    if (!workspace) return;

    const updatedMilestones = workspace.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );

    await supabase
      .from("workspaces")
      .update({ milestones: updatedMilestones })
      .eq("id", workspaceId);

    setWorkspace({ ...workspace, milestones: updatedMilestones });
  };

  const addCostItem = async () => {
    if (!newCostDesc.trim() || !newCostAmount || !workspace) return;
    setAddingCost(true);

    const costItem: CostItem = {
      id: Date.now().toString(),
      description: newCostDesc,
      amount: parseFloat(newCostAmount),
      created_at: new Date().toISOString(),
    };

    const updatedCosts = [...(workspace.cost_breakdown || []), costItem];

    await supabase
      .from("workspaces")
      .update({ cost_breakdown: updatedCosts })
      .eq("id", workspaceId);

    setWorkspace({ ...workspace, cost_breakdown: updatedCosts });
    setNewCostDesc("");
    setNewCostAmount("");
    setAddingCost(false);
  };

  const totalCost = workspace?.cost_breakdown?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const completedMilestones = workspace?.milestones?.filter((m) => m.completed).length || 0;
  const totalMilestones = workspace?.milestones?.length || 0;
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  if (!isLoaded || loading) {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-yellow-400 animate-pulse">⚡ Loading workspace...</p>
    </main>
  );
}

if (!workspace) {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      <p className="text-4xl mb-4">🔧</p>
      <h1 className="text-xl font-bold text-yellow-400 mb-3">Workspace Not Found</h1>
      <p className="text-gray-400 text-center mb-6">
        This workspace doesn&apos;t exist yet or hasn&apos;t been set up.
      </p>
      <button
        onClick={() => window.history.back()}
        className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl transition-all"
      >
        ← Go Back
      </button>
    </main>
  );
}

  const isClient = user?.id === workspace.client_id;

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* NAV */}
      <nav className="bg-black border-b-2 border-yellow-500 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <a href="/">
          <img src="/images/yte-icon.png" alt="YTE" className="h-12 w-auto" />
        </a>
        <div className="text-center">
          <p className="text-yellow-400 font-bold text-sm">🔧 Project Workspace</p>
          <p className="text-gray-500 text-xs">{workspace.problem}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-yellow-400 text-sm"
        >
          ← Back
        </button>
      </nav>

      {/* PROJECT HEADER */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-white font-bold text-lg">{workspace.problem}</h1>
              <p className="text-gray-400 text-xs mt-1">
                {isClient ? `Engineer: ${workspace.provider_name}` : `Client: ${workspace.client_name}`}
              </p>
              <p className="text-gray-600 text-xs">
                Started: {new Date(workspace.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${
              workspace.status === "active" ? "bg-green-500 text-black" :
              workspace.status === "completed" ? "bg-yellow-500 text-black" :
              "bg-gray-700 text-white"
            }`}>
              {workspace.status}
            </span>
          </div>

          {/* PROGRESS BAR */}
          {totalMilestones > 0 && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Project Progress</span>
                <span>{progress}% ({completedMilestones}/{totalMilestones} milestones)</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="bg-gray-900 border-b border-gray-800 px-6">
        <div className="max-w-4xl mx-auto flex gap-1 overflow-x-auto">
          {["chat", "milestones", "costs", "info"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-bold capitalize whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab === "chat" && "💬 Chat"}
              {tab === "milestones" && "📋 Milestones"}
              {tab === "costs" && "💰 Costs"}
              {tab === "info" && "ℹ️ Info"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">

        {/* CHAT TAB */}
        {activeTab === "chat" && (
          <div className="flex flex-col">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              {/* MESSAGES */}
<div className="h-96 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-950">
  {messages.length === 0 && (
    <div className="flex items-center justify-center h-full flex-col gap-3">
      <p className="text-4xl">💬</p>
      <p className="text-gray-600 text-sm text-center">
        No messages yet.<br />Start the conversation!
      </p>
    </div>
  )}
  {messages.map((msg, i) => {
    const isMe = msg.sender_id === user?.id;
    const showName = i === 0 || messages[i-1]?.sender_id !== msg.sender_id;
    return (
      <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-xs md:max-w-md ${isMe ? "items-end" : "items-start"} flex flex-col`}>
          {!isMe && showName && (
            <p className="text-yellow-400 text-xs font-bold mb-1 ml-1">{msg.sender_name}</p>
          )}
          <div className={`rounded-2xl px-4 py-3 shadow-lg ${
            isMe
              ? "bg-yellow-500 text-black rounded-tr-sm"
              : "bg-gray-800 text-white rounded-tl-sm"
          }`}>
            <p className="text-sm leading-relaxed">{msg.message}</p>
            <p className={`text-xs mt-1 ${isMe ? "text-black text-opacity-60 text-right" : "text-gray-500"}`}>
              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {isMe && " ✓✓"}
            </p>
          </div>
        </div>
      </div>
    );
  })}
  <div ref={messagesEndRef} />
</div>

{/* INPUT */}
<div className="border-t border-gray-800 p-4 flex gap-3 bg-gray-900">
  <input
    value={newMessage}
    onChange={(e) => setNewMessage(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
    placeholder="Type a message..."
    className="flex-1 bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-full px-5 py-3 text-white placeholder-gray-500 outline-none text-sm"
  />
  <button
    onClick={sendMessage}
    disabled={sending || !newMessage.trim()}
    className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-bold w-12 h-12 rounded-full transition-all flex items-center justify-center flex-shrink-0"
  >
    {sending ? "..." : "➤"}
  </button>
</div>
            </div>
          </div>
        )}

        {/* MILESTONES TAB */}
        {activeTab === "milestones" && (
          <div className="flex flex-col gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-yellow-400 font-bold mb-4">📋 Project Milestones</h3>

              {workspace.milestones?.length === 0 && (
                <p className="text-gray-500 text-sm text-center mb-4">No milestones yet. Add one below!</p>
              )}

              <div className="flex flex-col gap-3 mb-6">
                {workspace.milestones?.map((milestone, i) => (
                  <div
                    key={i}
                    onClick={() => toggleMilestone(milestone.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                      milestone.completed
                        ? "bg-yellow-500 bg-opacity-10 border border-yellow-500"
                        : "bg-gray-950 border border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      milestone.completed ? "bg-yellow-500 border-yellow-500" : "border-gray-600"
                    }`}>
                      {milestone.completed && <span className="text-black text-xs font-bold">✓</span>}
                    </div>
                    <p className={`text-sm flex-1 ${milestone.completed ? "text-yellow-400 line-through" : "text-white"}`}>
                      {milestone.title}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <input
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  placeholder="Add a milestone e.g. Site inspection completed"
                  className="flex-1 bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none text-sm"
                />
                <button
                  onClick={addMilestone}
                  disabled={addingMilestone || !newMilestone.trim()}
                  className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-bold px-6 py-3 rounded-xl transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COSTS TAB */}
        {activeTab === "costs" && (
          <div className="flex flex-col gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-yellow-400 font-bold">💰 Cost Breakdown</h3>
                <div className="text-right">
                  <p className="text-gray-400 text-xs">Total</p>
                  <p className="text-yellow-400 font-extrabold text-lg">
                    ₦{totalCost.toLocaleString()}
                  </p>
                </div>
              </div>

              {workspace.cost_breakdown?.length === 0 && (
                <p className="text-gray-500 text-sm text-center mb-4">No costs added yet.</p>
              )}

              <div className="flex flex-col gap-2 mb-6">
                {workspace.cost_breakdown?.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-950 border border-gray-800 rounded-xl p-4">
                    <p className="text-white text-sm">{item.description}</p>
                    <p className="text-yellow-400 font-bold text-sm">₦{item.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <input
                  value={newCostDesc}
                  onChange={(e) => setNewCostDesc(e.target.value)}
                  placeholder="Description e.g. Solar panels"
                  className="flex-1 bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none text-sm"
                />
                <input
                  value={newCostAmount}
                  onChange={(e) => setNewCostAmount(e.target.value)}
                  placeholder="Amount"
                  type="number"
                  className="w-32 bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none text-sm"
                />
                <button
                  onClick={addCostItem}
                  disabled={addingCost || !newCostDesc.trim() || !newCostAmount}
                  className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-bold px-6 py-3 rounded-xl transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INFO TAB */}
        {activeTab === "info" && (
          <div className="flex flex-col gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-yellow-400 font-bold mb-6">ℹ️ Project Information</h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between border-b border-gray-800 pb-3">
                  <span className="text-gray-400 text-sm">Problem</span>
                  <span className="text-white text-sm font-bold">{workspace.problem}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-3">
                  <span className="text-gray-400 text-sm">Client</span>
                  <span className="text-white text-sm">{workspace.client_name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-3">
                  <span className="text-gray-400 text-sm">Provider</span>
                  <span className="text-white text-sm">{workspace.provider_name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-3">
                  <span className="text-gray-400 text-sm">Status</span>
                  <span className={`text-sm font-bold capitalize ${
                    workspace.status === "active" ? "text-green-400" : "text-yellow-400"
                  }`}>{workspace.status}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-3">
                  <span className="text-gray-400 text-sm">Started</span>
                  <span className="text-white text-sm">{new Date(workspace.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-3">
                  <span className="text-gray-400 text-sm">Milestones</span>
                  <span className="text-white text-sm">{completedMilestones}/{totalMilestones} completed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Total Cost</span>
                  <span className="text-yellow-400 text-sm font-bold">₦{totalCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}