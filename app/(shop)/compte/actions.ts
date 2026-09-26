"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCustomer } from "@/lib/customer";
import { sanitizeCustomization } from "@/lib/profile-presets";

export async function updateProfileAction(formData: FormData) {
  const user = await requireCustomer();
  // Le pseudo se règle dans la personnalisation ; ici seul l'adresse change.
  const displayName = String(formData.get("displayName") ?? "").trim();
  const line1 = String(formData.get("line1") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const postal = String(formData.get("postal") ?? "").trim();
  const country =
    String(formData.get("country") ?? "FR").trim().toUpperCase() || "FR";

  await createAdminClient()
    .from("profiles")
    .update({
      ...(displayName ? { display_name: displayName } : {}),
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

/** Personnalisation façon Discord (validée côté serveur contre les presets). */
export async function updateProfileCustomizationAction(formData: FormData) {
  const user = await requireCustomer();
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) throw new Error("L’identifiant est requis.");

  const custom = sanitizeCustomization({
    bio: formData.get("bio"),
    pronouns: formData.get("pronouns"),
    statusText: formData.get("statusText"),
    avatarUrl: formData.get("avatarUrl"),
    avatarCrop: formData.get("avatarCrop"),
    avatarDecoration: formData.get("avatarDecoration"),
    profileFrame: formData.get("profileFrame"),
    banner: formData.get("banner"),
    accentColor: formData.get("accentColor"),
    nameStyle: formData.get("nameStyle"),
    nameplate: formData.get("nameplate"),
    profileEffect: formData.get("profileEffect"),
  });

  await createAdminClient()
    .from("profiles")
    .update({
      display_name: displayName,
      bio: custom.bio,
      pronouns: custom.pronouns,
      status_text: custom.statusText,
      avatar_url: custom.avatarUrl,
      avatar_crop: custom.avatarCrop,
      avatar_decoration: custom.avatarDecoration,
      profile_frame: custom.profileFrame,
      banner: custom.banner,
      accent_color: custom.accentColor,
      name_style: custom.nameStyle,
      nameplate: custom.nameplate,
      profile_effect: custom.profileEffect,
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
