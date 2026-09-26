import { BadgePercent, CheckCircle2, Save, ShieldCheck, UserRound } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProfile } from "@/lib/supabase/mappers";
import type { ProfileRow } from "@/lib/supabase/types";
import { ensureProfile } from "@/lib/customer";
import { getUserOrders } from "@/lib/orders";
import { ReferralBox } from "@/components/compte/referral-box";
import { AddressPicker } from "@/components/address/address-picker";
import { updateProfileAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ComptePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const sp = await searchParams;
  await ensureProfile();
  const { requireCustomer } = await import("@/lib/customer");
  const user = await requireCustomer();

  const { data } = await createAdminClient()
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  const profile = data ? mapProfile(data as unknown as ProfileRow) : null;
  const orders = await getUserOrders(user.id);
  // Photo Google (lecture seule, pas d'upload sur le plan Spark).
  const avatarUrl = String(user.user_metadata?.avatar_url ?? "");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="kicker text-coral">Ton espace</p>
        <h1 className="mt-1 font-display text-3xl font-light tracking-tight text-espresso sm:text-4xl">
          Ton profil
        </h1>
        <p className="mt-2 text-sm text-cocoa/70">
          {user.email} — ça pré-remplit tes commandes. Moins de formulaires,
          plus de jeu.
        </p>
      </div>

      {orders.length === 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-honey/40 bg-honey/10 px-4 py-3.5">
          <BadgePercent className="h-5 w-5 shrink-0 text-[#7a4d0c]" />
          <p className="text-sm text-espresso">
            Bienvenue. −10 % sur ta première commande avec{" "}
            <span className="font-mono font-bold tracking-wide">WELCOME10</span>,
            à coller dans le champ promo au paiement.
          </p>
        </div>
      )}

      {sp.saved && (
        <p className="flex items-center gap-2 rounded-2xl border border-espresso/15 bg-cream-deep px-4 py-3 text-sm font-semibold text-espresso">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Enregistré. Bien joué.
        </p>
      )}

      <ReferralBox />

      <form action={updateProfileAction} className="card space-y-5 p-6 sm:p-8">
        <h2 className="font-display flex items-center gap-2 text-lg font-normal text-espresso">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cream-deep text-espresso">
            <UserRound className="h-4 w-4" />
          </span>
          Personnalisation
        </h2>
        <div className="flex items-center gap-4 rounded-2xl bg-cream/60 px-4 py-3 ring-1 ring-espresso/10">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="h-14 w-14 shrink-0 rounded-full bg-cream-deep object-cover ring-1 ring-espresso/10"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cream-deep font-display text-2xl text-espresso">
              {(profile?.displayName ?? user.email ?? "?").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-bold text-espresso">
              {profile?.displayName || "Ton pseudo"}
            </p>
            <p className="truncate text-xs text-cocoa/60">{user.email}</p>
            {avatarUrl && (
              <p className="mt-0.5 text-[11px] text-cocoa/50">
                Photo importée de Google
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="displayName">
            Identifiant (pseudo) *
          </label>
          <input
            id="displayName"
            name="displayName"
            required
            defaultValue={profile?.displayName ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="line1">
            Adresse
          </label>
          <input
            id="line1"
            name="line1"
            defaultValue={profile?.addressLine1 ?? ""}
            className="input"
            placeholder="12 rue des Lilas"
            autoComplete="street-address"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="city">
              Ville
            </label>
            <input
              id="city"
              name="city"
              defaultValue={profile?.addressCity ?? ""}
              className="input"
              placeholder="Paris"
              autoComplete="address-level2"
            />
          </div>
          <div>
            <label className="label" htmlFor="postal">
              Code postal
            </label>
            <input
              id="postal"
              name="postal"
              defaultValue={profile?.addressPostalCode ?? ""}
              className="input"
              placeholder="75011"
              autoComplete="postal-code"
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="country">
            Pays
          </label>
          <select
            id="country"
            name="country"
            defaultValue={profile?.addressCountry ?? "FR"}
            className="input"
          >
            <option value="FR">France</option>
            <option value="BE">Belgique</option>
            <option value="CH">Suisse</option>
            <option value="LU">Luxembourg</option>
            <option value="CA">Canada</option>
          </select>
        </div>
        <AddressPicker />
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button type="submit" className="btn-primary">
            <Save className="h-4 w-4" /> Enregistrer
          </button>
          <p className="flex items-center gap-1.5 text-xs text-cocoa/60">
            <ShieldCheck className="h-3.5 w-3.5" /> Seules tes commandes voient
            ça.
          </p>
        </div>
      </form>
    </div>
  );
}
