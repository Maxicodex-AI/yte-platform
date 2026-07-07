import { supabase } from "./supabase";

export const notify = async (
  userId: string,
  title: string,
  message: string,
  type: string
) => {
  // Check if same notification already exists in last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", userId)
    .eq("title", title)
    .eq("message", message)
    .gte("created_at", fiveMinutesAgo)
    .single();

  if (existing) return; // Don't create duplicate

  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    type,
    read: false,
  });
};