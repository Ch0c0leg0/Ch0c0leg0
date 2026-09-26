"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCustomer } from "@/lib/customer";

export async function updateProfileAction(formData: FormData) {
  const user = await requireCustomer();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const line1 = String(formData.get("line1") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const postal = String(formData.get("postal") ?? "").trim();
  const country =
    String(formData.get("country") ?? "FR").trim().toUpperCase() || "FR";
  if (!displayName) throw new Error("L’identifiant est requis.");

  await createAdminClient()
    .from("profiles")
    .update({
      display_name: displayName,
      address_line1: line1,
      address_city: city,
      address_postal_code: postal,
      address_country: country,
      updated_at: Date.now(),
    })
    .eq("id", user.id);

  revalidatePath("/compte");
  redirect("/compte?saved=1");
}

export async function logoutCustomerAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
