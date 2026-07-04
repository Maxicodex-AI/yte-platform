"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Onboarding() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const selectRole = async (role: "client" | "technician" | "engineer") => {
    if (!user) return;
    setLoading(true);
    try {
      await user.update({
        unsafeMetadata: { role },
      });

      // Save user to Supabase users table
      const { data: existing } = await supabase
        .from("users")
        .select("*")
        .eq("clerk_id", user.id)
        .single();

      if (!existing) {
        await supabase.from("users").insert({
          clerk_id: user.id,
          full_name: user.fullName || "",
          email: user.primaryEmailAddress?.emailAddress || "",
          role,
          photo_url: user.imageUrl || "",
          is_admin: false,
          is_suspended: false,
          jobs_completed: 0,
          average_rating: 0,
          joined_at: new Date().toISOString(),
        });
      } else {
        await supabase
          .from("users")
          .update({ role })
          .eq("clerk_id", user.id);
      }

      router.push("/");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      
      {/* LOGO */}
      <a href="/">
        <img src="/images/yte-logo.png" alt="YTE Logo" className="h-32 w-auto mb-8" />
      </a>

      <h1 className="text-3xl font-extrabold text-yellow-400 mb-3">Welcome to YTE!</h1>
      <p className="text-gray-400 mb-12 text-center max-w-md">
        Tell us who you are so we can set up your experience.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        
        {/* CLIENT */}
        <button
          onClick={() => selectRole("client")}
          disabled={loading}
          className="bg-gray-900 border-2 border-gray-800 hover:border-yellow-500 rounded-2xl p-8 text-center transition-all disabled:opacity-50 group"
        >
          <div className="text-5xl mb-4">🙋</div>
          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-all">
            I&apos;m a Client
          </h2>
          <p className="text-gray-400 text-sm">I need help with an engineering or technical problem.</p>
        </button>

        {/* TECHNICIAN */}
        <button
          onClick={() => selectRole("technician")}
          disabled={loading}
          className="bg-gray-900 border-2 border-gray-800 hover:border-yellow-500 rounded-2xl p-8 text-center transition-all disabled:opacity-50 group"
        >
          <div className="text-5xl mb-4">🛠️</div>
          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-all">
            I&apos;m a Technician
          </h2>
          <p className="text-gray-400 text-sm">I offer technical skills and want to find standard jobs.</p>
        </button>

        {/* ENGINEER */}
        <button
          onClick={() => selectRole("engineer")}
          disabled={loading}
          className="bg-gray-900 border-2 border-gray-800 hover:border-yellow-500 rounded-2xl p-8 text-center transition-all disabled:opacity-50 group"
        >
          <div className="text-5xl mb-4">👷</div>
          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-all">
            I&apos;m an Engineer
          </h2>
          <p className="text-gray-400 text-sm">I&apos;m a certified professional and can handle contracts too.</p>
        </button>

      </div>

      {loading && (
        <p className="text-yellow-400 mt-8 animate-pulse">⚡ Setting things up...</p>
      )}

      <p className="text-gray-600 text-xs mt-12 text-center">
        Engineering Excellence • Technology Innovation • Endless Possibilities
      </p>
    </main>
  );
}