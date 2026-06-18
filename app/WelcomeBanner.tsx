"use client";
import { useUser } from "@clerk/nextjs";

export default function WelcomeBanner() {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) return null;

  const role = user.unsafeMetadata?.role as string | undefined;

  if (!role) return null;

  return (
    <div className="bg-green-500 text-black text-center py-2 text-sm font-medium">
      {role === "client"
        ? `Welcome back, ${user.firstName || "Client"}! 🙋 Looking for help today?`
        : `Welcome back, ${user.firstName || "Provider"}! 🛠️ Ready for new jobs?`}
    </div>
  );
}