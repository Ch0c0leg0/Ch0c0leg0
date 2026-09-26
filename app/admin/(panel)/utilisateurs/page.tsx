import Link from "next/link";
import { Users, Wifi, Banknote } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProfile } from "@/lib/supabase/mappers";
import type { OrderRow, ProfileRow } from "@/lib/supabase/types";
import { ONLINE_WINDOW_MS } from "@/lib/customer";
import { formatPrice, formatDate } from "@/lib/format";
import { RefreshButton } from "@/components/admin/refresh-button";

export const dynamic = "force-dynamic";

const SPENT_STATUSES = new Set(["paid", "processing", "shipped", "delivered"]);

function relativeTime(ts: number | null): string {
  if (!ts) return "Jamais vu";
  const diff = Date.now() - ts;
  if (diff < 60 * 1000) return "À l'instant";
  if (diff < 60 * 60 * 1000) {
    const m = Math.floor(diff / (60 * 1000));
    return `Il y a ${m} min`;
  }
  if (diff < 24 * 60 * 60 * 1000) {
    const h = Math.floor(diff / (60 * 60 * 1000));
    return `Il y a ${h} h`;
  }
  if (diff < 30 * 24 * 60 * 60 * 1000) {
    const d = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `Il y a ${d} j`;
  }
  return formatDate(ts);
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; statut?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const statutFilter = sp.statut === "en-ligne" || sp.statut === "hors-ligne" ? sp.statut : "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const perPage = 20;
  const admin = createAdminClient();

  const [{ data: profileRows }, { data: orderRows }] = await Promise.all([
    admin.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
    admin
      .from("orders")
      .select("user_id,amount_total,status,created_at")
      .order("created_at", { ascending: false })
      .limit(2000),
  ]);

  const profiles = Array.isArray(profileRows)
    ? (profileRows as unknown as ProfileRow[]).map(mapProfile)
    : [];
  const orders = Array.isArray(orderRows) ? (orderRows as unknown as OrderRow[]) : [];

  // Agrégats par compte : total dépensé (commandes encaissées) + nb commandes.
  const spentByUser = new Map<string, { spent: number; orders: number; lastOrderAt: number }>();
  let guestOrders = 0;
  let guestRevenue = 0;
  for (const o of orders) {
    const total = Number(o.amount_total ?? 0);
    const status = String(o.status ?? "");
    const uid = o.user_id ? String(o.user_id) : null;
    if (!uid) {
      guestOrders += 1;
      if (SPENT_STATUSES.has(status)) guestRevenue += total;
      continue;
    }
    const cur = spentByUser.get(uid) ?? { spent: 0, orders: 0, lastOrderAt: 0 };
    cur.orders += 1;
    if (SPENT_STATUSES.has(status)) cur.spent += total;
    const at = Number(o.created_at ?? 0);
    if (at > cur.lastOrderAt) cur.lastOrderAt = at;
    spentByUser.set(uid, cur);
  }

  const now = Date.now();
  const enriched = profiles.map((p) => {
    const stats = spentByUser.get(p.id) ?? { spent: 0, orders: 0, lastOrderAt: 0 };
    const online = p.lastSeenAt !== null && now - p.lastSeenAt < ONLINE_WINDOW_MS;
    return { profile: p, ...stats, online };
  });

  const onlineCount = enriched.filter((e) => e.online).length;
  const accountsRevenue = enriched.reduce((s, e) => s + e.spent, 0);

  const filtered = enriched.filter((e) => {
    if (statutFilter === "en-ligne" && !e.online) return false;
    if (statutFilter === "hors-ligne" && e.online) return false;
    if (!q) return true;
    return (
      e.profile.displayName.toLowerCase().includes(q) ||
      e.profile.email.toLowerCase().includes(q) ||
      e.profile.addressCity.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const list = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-honey">
            Comptes
          </p>
          <h1 className="font-display mt-1 text-3xl font-light tracking-tight">
            Utilisateurs
          </h1>
          <p className="mt-1 text-sm text-cocoa/60">
            {profiles.length} compte(s) — présence mise à jour à chaque visite connectée
            (fenêtre 10 min).
          </p>
        </div>
        <RefreshButton />
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card bg-white p-5">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-cocoa/60">
            <Users className="h-4 w-4" /> Comptes
          </p>
          <p className="font-display mt-2 text-3xl font-normal text-espresso">{profiles.length}</p>
          <p className="mt-1 text-xs text-cocoa/60">
            + {guestOrders} commande(s) invité(s) ({formatPrice(guestRevenue)})
          </p>
        </div>
        <div className="card bg-white p-5">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-cocoa/60">
            <Wifi className="h-4 w-4" /> En ligne
          </p>
          <p className="font-display mt-2 text-3xl font-normal text-espresso">{onlineCount}</p>
          <p className="mt-1 text-xs text-cocoa/60">Actifs dans les 10 dernières minutes</p>
        </div>
        <div className="card bg-white p-5">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-cocoa/60">
            <Banknote className="h-4 w-4" /> Dépensé (comptes)
          </p>
          <p className="font-display mt-2 text-3xl font-normal text-espresso">{formatPrice(accountsRevenue)}</p>
          <p className="mt-1 text-xs text-cocoa/60">Cumul payé + préparation + expédié + livré</p>
        </div>
      </div>

      <form action="/admin/utilisateurs" className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Pseudo, e-mail, ville…"
          className="input w-60 py-2 text-sm"
        />
        <select name="statut" defaultValue={statutFilter} className="input w-44 py-2 text-sm">
          <option value="">Tous statuts</option>
          <option value="en-ligne">En ligne</option>
          <option value="hors-ligne">Hors ligne</option>
        </select>
        <button type="submit" className="btn-outline text-sm">
          Filtrer
        </button>
      </form>

      {totalPages > 1 && (
        <div className="flex items-center gap-2 text-sm text-cocoa/60">
          <span>
            Page {safePage}/{totalPages} — {filtered.length} résultat(s)
          </span>
          {safePage > 1 && (
            <Link
              href={`/admin/utilisateurs?q=${encodeURIComponent(sp.q ?? "")}&statut=${statutFilter}&page=${safePage - 1}`}
              className="btn-ghost text-xs"
            >
              ← Précédent
            </Link>
          )}
          {safePage < totalPages && (
            <Link
              href={`/admin/utilisateurs?q=${encodeURIComponent(sp.q ?? "")}&statut=${statutFilter}&page=${safePage + 1}`}
              className="btn-ghost text-xs"
            >
              Suivant →
            </Link>
          )}
        </div>
      )}

      <div className="card overflow-hidden">
        {list.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-cocoa/50">
            Aucun compte pour le moment. Les inscriptions arrivent ici.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-espresso/10 bg-cream/50 text-left text-[11px] uppercase tracking-[0.14em] text-cocoa/60">
                  <th className="px-5 py-3 font-bold">Utilisateur</th>
                  <th className="px-5 py-3 font-bold">Statut</th>
                  <th className="px-5 py-3 font-bold text-right">Commandes</th>
                  <th className="px-5 py-3 font-bold text-right">Total dépensé</th>
                  <th className="px-5 py-3 font-bold">Inscrit le</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso/8">
                {list.map(({ profile: p, spent, orders: orderCount, online }) => (
                  <tr key={p.id} className="transition-colors hover:bg-cream/70">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-deep font-display text-lg text-espresso">
                          {(p.displayName || p.email || "?").charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-espresso">
                            {p.displayName || "Sans pseudo"}
                          </p>
                          <p className="truncate text-xs text-cocoa/50">{p.email || "—"}</p>
                          {p.addressCity && (
                            <p className="truncate text-xs text-cocoa/50">{p.addressCity}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {online ? (
                        <span className="badge-green">
                          <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                          En ligne
                        </span>
                      ) : (
                        <span className="badge-stone" title={p.lastSeenAt ? formatDate(p.lastSeenAt) : undefined}>
                          {relativeTime(p.lastSeenAt)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-espresso">{orderCount}</td>
                    <td className="px-5 py-3 text-right font-bold text-espresso">{formatPrice(spent)}</td>
                    <td className="px-5 py-3 text-cocoa/70">{p.createdAt ? formatDate(p.createdAt) : "—"}</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/orders?q=${encodeURIComponent(p.email || p.displayName)}`}
                        className="btn-ghost text-xs"
                      >
                        Voir commandes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
