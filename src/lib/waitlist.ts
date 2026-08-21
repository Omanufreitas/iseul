import { createAdminClient } from "@/lib/supabase/client";

export type WaitlistSubscriber = {
  id: string;
  email: string;
  source: string;
  created_at: string;
};

export async function listWaitlistSubscribers(): Promise<WaitlistSubscriber[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("waitlist_subscribers")
    .select("id, email, source, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as WaitlistSubscriber[];
}

export async function subscribeWaitlist(email: string, source = "landing"): Promise<{ ok: true }> {
  const supabase = createAdminClient();
  const normalized = email.trim().toLowerCase();

  const { error } = await supabase.from("waitlist_subscribers").insert({
    email: normalized,
    source,
  });

  if (error) {
    if (error.code === "23505") return { ok: true };
    throw new Error(error.message);
  }

  return { ok: true };
}
