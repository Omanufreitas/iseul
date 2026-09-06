import { createAdminClient } from "@/lib/supabase/client";

export type WaitlistSubscriber = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  product_id: string | null;
  product_name: string | null;
  created_at: string;
};

export async function listWaitlistSubscribers(): Promise<WaitlistSubscriber[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("waitlist_subscribers")
    .select("id, name, email, phone, source, product_id, product_name, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const subscribers = (data ?? []) as WaitlistSubscriber[];
  const missingContact = subscribers.filter((s) => !s.name.trim() || !s.phone.trim());
  if (missingContact.length === 0) return subscribers;

  const emails = [...new Set(missingContact.map((s) => s.email.trim().toLowerCase()))];
  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("email, full_name, phone")
    .in("email", emails);

  if (customersError || !customers?.length) return subscribers;

  const byEmail = new Map(
    customers.map((c) => [c.email.trim().toLowerCase(), c]),
  );

  return subscribers.map((subscriber) => {
    if (subscriber.name.trim() && subscriber.phone.trim()) return subscriber;

    const customer = byEmail.get(subscriber.email.trim().toLowerCase());
    if (!customer) return subscriber;

    return {
      ...subscriber,
      name: subscriber.name.trim() || customer.full_name.trim(),
      phone: subscriber.phone.trim() || (customer.phone ?? "").trim(),
    };
  });
}

type SubscribeWaitlistOptions = {
  name?: string;
  phone?: string;
};

export async function subscribeWaitlist(
  email: string,
  source = "landing",
  options: SubscribeWaitlistOptions = {},
): Promise<{ ok: true }> {
  const supabase = createAdminClient();
  const normalized = email.trim().toLowerCase();
  const name = options.name?.trim() ?? "";
  const phone = options.phone?.replace(/\D/g, "") ?? "";

  const { error } = await supabase.from("waitlist_subscribers").insert({
    email: normalized,
    source,
    name,
    phone,
  });

  if (error) {
    if (error.code === "23505") {
      const patch: { name?: string; phone?: string; source?: string } = {};
      if (name) patch.name = name;
      if (phone) patch.phone = phone;
      if (source !== "landing") patch.source = source;
      if (Object.keys(patch).length > 0) {
        await supabase.from("waitlist_subscribers").update(patch).eq("email", normalized);
      }
      return { ok: true };
    }
    throw new Error(error.message);
  }

  return { ok: true };
}

type ProductInterestInput = {
  productId: string;
  productName: string;
  name: string;
  email: string;
  phone: string;
};

export async function subscribeProductInterest(input: ProductInterestInput): Promise<{ ok: true }> {
  const supabase = createAdminClient();
  const normalized = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const phone = input.phone.replace(/\D/g, "");

  const { error } = await supabase.from("waitlist_subscribers").insert({
    email: normalized,
    name,
    phone,
    source: "product_back_in_stock",
    product_id: input.productId,
    product_name: input.productName.trim(),
  });

  if (error) {
    if (error.code === "23505") {
      await supabase
        .from("waitlist_subscribers")
        .update({ name, phone, product_name: input.productName.trim() })
        .eq("email", normalized)
        .eq("product_id", input.productId);
      return { ok: true };
    }
    throw new Error(error.message);
  }

  return { ok: true };
}
