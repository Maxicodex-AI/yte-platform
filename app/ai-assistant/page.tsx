"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

type Provider = {
  clerk_id: string;
  full_name: string;
  photo_url: string;
  role: string;
  skills: string;
  location: string;
  rating: number;
  verified: boolean;
};

export default function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);

  const findRelevantProviders = async (query: string) => {
    const { data } = await supabase
      .from("providers")
      .select("*")
      .eq("verified", true)
      .eq("available", true);

    if (!data) return [];

    const keywords = query.toLowerCase().split(" ");
    const relevant = data.filter((p: Provider) => {
      const skills = (p.skills || "").toLowerCase();
      return keywords.some((word) =>
        skills.includes(word) ||
        skills.includes("electrical") ||
        skills.includes("solar") ||
        skills.includes("borehole") ||
        skills.includes("plumbing") ||
        skills.includes("automation")
      );
    });

    return relevant.slice(0, 3);
  };

  const askAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResponse("");
    setProviders([]);
    const currentQuestion = question;
    setQuestion("");

    try {
      const [res, relevantProviders] = await Promise.all([
        fetch("/api/ai-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: currentQuestion }),
        }),
        findRelevantProviders(currentQuestion),
      ]);
      const data = await res.json();
      setResponse(data.answer);
      setProviders(relevantProviders);
    } catch {
      setResponse("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const { user, isLoaded } = useUser();
const router = useRouter();

if (!isLoaded) return null;

if (!user) {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      <p className="text-4xl mb-4">🤖</p>
      <h1 className="text-2xl font-bold text-yellow-400 mb-3">YTE AI Assistant</h1>
      <p className="text-gray-400 text-center mb-6">
        Create a free account to access our AI Engineering Assistant
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
  <a
    href="/"
    className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl text-lg transition-all text-center"
  >
    Sign Up Free →
  </a>
  <a
    href="/"
    className="border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black font-bold px-8 py-4 rounded-xl text-lg transition-all text-center"
  >
    Sign In
  </a>
</div>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-2 bg-black border-b-2 border-yellow-500 shadow-lg z-50">
        <a href="/"><img src="/images/yte-icon.png" alt="YTE Logo" className="h-16 w-auto" /></a>
        <a href="/" className="text-gray-400 hover:text-yellow-400 text-sm font-semibold">Back to Home</a>
      </nav>

      <div className="max-w-3xl mx-auto pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-yellow-400 mb-3">🤖 YTE AI Assistant</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Describe your engineering problem and get instant expert diagnosis and solutions.
          </p>
        </div>

        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-3">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "My inverter is not charging",
              "How do I install solar for a 3 bedroom house?",
              "My borehole pump is not working",
              "How do I wire a distribution board?",
            ].map((example, i) => (
              <button
                key={i}
                onClick={() => setQuestion(example)}
                className="text-xs bg-gray-800 hover:bg-yellow-500 hover:text-black text-gray-300 px-3 py-2 rounded-full transition-all border border-gray-700"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Describe your engineering problem..."
            className="w-full bg-gray-900 border border-gray-700 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 resize-none outline-none"
            rows={3}
          />
        </div>

        <button
          onClick={askAI}
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-bold py-4 rounded-xl transition-all text-lg mb-8"
        >
          {loading ? "⚡ Analyzing your problem..." : "🔍 Get Engineering Solution"}
        </button>

        {response && (
          <div className="bg-gray-900 border border-yellow-500 rounded-xl p-6 mb-6">
            <h3 className="text-yellow-400 font-bold text-lg mb-4">⚡ YTE Engineer Response:</h3>
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">{response}</div>
          </div>
        )}

        {providers.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <h3 className="text-yellow-400 font-bold text-lg mb-2">🔧 Recommended YTE Verified Providers</h3>
            <p className="text-gray-500 text-xs mb-4">These verified professionals can help fix your problem:</p>
            <div className="flex flex-col gap-4">
              {providers.map((provider, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {provider.photo_url ? (
                      <img src={provider.photo_url} alt={provider.full_name} className="w-12 h-12 rounded-full border-2 border-yellow-500" />
                    ) : (
                      <div className="w-12 h-12 rounded-full border-2 border-yellow-500 bg-gray-800 flex items-center justify-center text-yellow-400 font-bold">
                        {(provider.full_name || "P")[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold text-sm">{provider.full_name}</p>
                        <span className="text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold">✓ Verified</span>
                      </div>
                      <p className="text-gray-400 text-xs capitalize">{provider.role}</p>
                      {provider.skills && <p className="text-gray-500 text-xs">🛠️ {provider.skills}</p>}
                      {provider.location && <p className="text-gray-500 text-xs">📍 {provider.location}</p>}
                      <p className="text-gray-600 text-xs">⭐ {provider.rating || 0} rating</p>
                    </div>
                  </div>
                  <a href="/client-dashboard" className="text-xs bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg transition-all whitespace-nowrap">
                    Hire Now
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="text-center py-6 mt-12 text-gray-600 text-sm border-t border-yellow-900">
        © 2026 Young Technology Engineers. All rights reserved.
      </footer>
    </main>
  );
}