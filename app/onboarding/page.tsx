"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const selectRole = async (role: "client" | "provider") => {
    if (!user) return;
    setLoading(true);
    try {
      await user.update({
        unsafeMetadata: { role },
      });
      router.push("/");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-extrabold text-green-400 mb-3">Welcome to YTE! ⚡</h1>
      <p className="text-gray-400 mb-12 text-center max-w-md">
        Tell us who you are so we can set up your experience.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
        <button
          onClick={() => selectRole("client")}
          disabled={loading}
          className="bg-gray-900 border-2 border-gray-800 hover:border-green-500 rounded-2xl p-8 text-center transition-all disabled:opacity-50"
        >
          <div className="text-5xl mb-4">🙋</div>
          <h2 className="text-xl font-bold text-white mb-2">I&apos;m a Client</h2>
          <p className="text-gray-400 text-sm">I need help with an engineering or technical problem.</p>
        </button>

        <button
          onClick={() => selectRole("provider")}
          disabled={loading}
          className="bg-gray-900 border-2 border-gray-800 hover:border-green-500 rounded-2xl p-8 text-center transition-all disabled:opacity-50"
        >
          <div className="text-5xl mb-4">🛠️</div>
          <h2 className="text-xl font-bold text-white mb-2">I&apos;m a Technician / Engineer</h2>
          <p className="text-gray-400 text-sm">I want to offer my skills and find jobs.</p>
        </button>
      </div>

      {loading && <p className="text-green-400 mt-8">Setting things up...</p>}
    </main>
  );
}