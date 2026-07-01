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

  const roleConfig = {
    client: {
      label: "Client Portal",
      message: `Welcome, ${user.firstName || "Client"}`,
      sub: "Find trusted engineers and technicians near you.",
      icon: "🙋",
    },
    engineer: {
      label: "Engineer Portal",
      message: `Welcome, ${user.firstName || "Engineer"}`,
      sub: "You have access to all jobs including contracts.",
      icon: "👷",
    },
    technician: {
      label: "Technician Portal",
      message: `Welcome, ${user.firstName || "Technician"}`,
      sub: "Browse available standard jobs near you.",
      icon: "🛠️",
    },
  };

  const config = roleConfig[role as keyof typeof roleConfig];

  if (!config) return null;

  return (
    <div className="bg-black border-b border-yellow-900 px-8 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className="text-xl">{config.icon}</span>
        <div>
          <p className="text-yellow-400 font-bold text-sm">{config.message}</p>
          <p className="text-gray-500 text-xs">{config.sub}</p>
        </div>
      </div>
      <span className="text-xs border border-yellow-700 text-yellow-600 px-3 py-1 rounded-full">
        {config.label}
      </span>
    </div>
  );
}