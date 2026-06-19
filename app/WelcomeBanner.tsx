"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WelcomeBanner() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const role = user.unsafeMetadata?.role as string | undefined;
      if (!role) {
        router.push("/onboarding");
      }
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) return null;

  const role = user.unsafeMetadata?.role as string | undefined;

  if (!role) return null;

  return (
    <div className="bg-green-500 text-black text-center py-2 text-sm font-medium">
      {role === "client"
        ? `Welcome back, ${user.firstName || "Client"}! 🙋 Looking for help today?`
        : role === "engineer"
        ? `Welcome back, ${user.firstName || "Engineer"}! 👷 Ready for new contracts?`
        : `Welcome back, ${user.firstName || "Technician"}! 🛠️ Ready for new jobs?`}
    </div>
  );
}