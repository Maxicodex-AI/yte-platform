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

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-2 bg-black border-b-2 border-yellow-500 shadow-lg z-50">
        <a href="/">
          <img
            src="/images/yte-icon.png"
            alt="YTE Logo"
            className="h-16 w-auto"
          />
        </a>
        <a href="/" className="text-gray-400 hover:text-yellow-400 text-sm font-semibold">← Back to Home</a>
      </nav>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto pt-24">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-yellow-400 mb-3">🤖 YTE AI Assistant</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Describe your engineering problem and get instant expert diagnosis and solutions.
          </p>
        </div>

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
                className="text-xs bg-gray-800 hover:bg-yellow-500 hover:text-black text-gray-300 px-3 py-2 rounded-full transition-all border border-gray-700 hover:border-yellow-500"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT */}
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

        {/* RESPONSE */}
        {response && (
          <div className="bg-gray-900 border border-yellow-500 rounded-xl p-6">
            <h3 className="text-yellow-400 font-bold text-lg mb-4">⚡ YTE Engineer Response:</h3>
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">{response}</div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="text-center py-6 mt-12 text-gray-600 text-sm border-t border-yellow-900">
        © 2026 Young Technology Engineers. All rights reserved.
      </footer>

    </main>
  );
}