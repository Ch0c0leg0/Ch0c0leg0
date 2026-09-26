import { createAdminClient } from "@/lib/supabase/admin";
import { deleteSubscriberAction, sendTestEmailAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { RefreshButton } from "@/components/admin/refresh-button";
import { emailConfigured } from "@/lib/email";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const { data } = await createAdminClient()
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  const list = (
    Array.isArray(data)
      ? (data as unknown as { id: number; email: string; created_at: number }[])
      : []
  );
  const configured = emailConfigured();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-honey">
            Marketing
          </p>
          <h1 className="font-display mt-1 text-3xl font-light tracking-tight">
            Newsletter
          </h1>
          <p className="mt-1 text-sm text-cocoa/60">
            {list.length} inscrit(s) — exporte cette liste vers ton routeur d'e-mails.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <form action={sendTestEmailAction}>
            <button type="submit" className="btn-outline text-xs">
              M'envoyer un test
            </button>
          </form>
        </div>
      </header>

      <div
        className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm ${
          configured
            ? "border-espresso/15 bg-cream-deep text-espresso"
            : "border-coral/30 bg-coral/10 text-[#b23a20]"
        }`}
      >
        <span
          aria-hidden
          className={`h-2 w-2 shrink-0 rounded-full ${configured ? "bg-espresso" : "bg-coral"}`}
        />
        {configured ? (
          <p>
            Envois actifs via Brevo (300 e-mails/jour, gratuit). Les e-mails partent{" "}
            <strong>à tous les abonnés</strong> depuis l'expéditeur vérifié <strong>{process.env.BREVO_FROM ?? ""}</strong>.{" "}
            <span className="text-cocoa/60">Un lien de désinscription est ajouté à chaque e-mail.</span>
          </p>
        ) : (
          <p>
            Envois désactivés : ajoute <span className="font-mono">BREVO_API_KEY</span> et un{" "}
            <span className="font-mono">BREVO_FROM</span> vérifié dans{" "}
            <span className="font-mono">.env.local</span> puis redémarre le serveur (Settings → Senders sur brevo.com).
          </p>
        )}
      </div>

      <div className="card overflow-hidden">
        {list.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-cocoa/50">
            Aucun inscrit pour l'instant. Le formulaire est dans le pied de page.
          </p>
        ) : (
          <ul className="divide-y divide-espresso/8">
            {list.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-cream/70"
              >
                <div>
                  <p className="text-sm font-semibold text-espresso">{s.email}</p>
                  <p className="text-xs text-cocoa/50">
                    Inscrit le {formatDate(Number(s.created_at ?? 0))}
                  </p>
                </div>
                <DeleteButton
                  action={deleteSubscriberAction}
                  id={s.id}
                  label="Retirer"
                  confirmMessage={`Retirer ${s.email} de la newsletter ?`}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
