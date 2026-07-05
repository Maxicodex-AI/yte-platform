"use client";
import { useUser } from "@clerk/nextjs";

const ADMIN_EMAILS = ["techkelvin001@gmail.com", "chienyimax911@gmail.com"];

export default function DashboardLink() {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) return null;

  const email = user.primaryEmailAddress?.emailAddress || "";
  const role = user.unsafeMetadata?.role as string | undefined;
  const isAdmin = ADMIN_EMAILS.includes(email);

  if (isAdmin) {
    return (
      <div className="flex items-center gap-3">
        <a href="/admin" className="text-xs bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-3 py-1 rounded-full transition-all">
          🔐 Admin Panel
        </a>
      </div>
    );
  }

  const href = role === "client" ? "/client-dashboard" : "/dashboard";

  return (
    <a href={href} className="hover:text-yellow-400 text-gray-300 text-sm font-semibold">
      Dashboard
    </a>
  );
}