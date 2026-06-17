"use client";
import { useState } from "react";

export default function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setResponse(data.answer);
    } catch (error) {
      setResponse("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-12">
      
      {/* HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-green-400 mb-3">🤖 YTE AI Assistant</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Describe your engineering problem and get instant expert diagnosis and solutions.
        </p>
      </div>

      {/* CHAT BOX */}
      <div className="max-w-3xl mx-auto">
        
        {/* EXAMPLE QUESTIONS */}
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
                className="text-xs bg-gray-800 hover:bg-green-500 hover:text-black text-gray-300 px-3 py-2 rounded-full transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT */}
        <div className="flex gap-3 mb-6">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Describe your engineering problem..."
            className="flex-1 bg-gray-900 border border-gray-700 focus:border-green-500 rounded-xl p-4 text-white placeholder-gray-500 resize-none outline-none"
            rows={3}
          />
        </div>
        <button
          onClick={askAI}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-700 text-black font-bold py-4 rounded-xl transition-all text-lg"
        >
          {loading ? "⚡ Analyzing your problem..." : "🔍 Get Engineering Solution"}
        </button>

        {/* RESPONSE */}
        {response && (
          <div className="mt-8 bg-gray-900 border border-green-500 rounded-xl p-6">
            <h3 className="text-green-400 font-bold text-lg mb-4">⚡ YTE Engineer Response:</h3>
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">{response}</div>
          </div>
        )}
      </div>
    </main>
  );
}