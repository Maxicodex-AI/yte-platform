"use client";
import { useUser } from "@clerk/nextjs";

export default function DashboardLink() {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) return null;

  const role = user.unsafeMetadata?.role as string | undefined;

  const href =
    role === "client"
      ? "/client-dashboard"
      : "/dashboard";

  return (
    <a href={href} className="hover:text-yellow-400 text-gray-300 text-sm font-semibold">
      Dashboard
    </a>
  );
}