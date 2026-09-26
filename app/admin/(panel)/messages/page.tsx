import { Inbox, Trash2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  deleteMessageAction,
  markMessageReadAction,
} from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { RefreshButton } from "@/components/admin/refresh-button";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Message = {
  id: number;
  name: string;
  email: string;
  subject: string;
  body: string;
  read: boolean;
  created_at: number;
};

const SUBJECTS: Record<string, string> = {
  commande: "Ma commande",
  livraison: "Livraison / retour",
  produit: "Question produit",
  compte: "Mon compte",
  autre: "Autre chose",
};

export default async function AdminMessagesPage() {
  const { data } = await createAdminClient()
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const list = (
    Array.isArray(data)
      ? (data as unknown as {
          id: number;
          name: string;
          email: string;
          subject: string;
          body: string;
          read: boolean;
          created_at: number | string;
        }[])
      : []
  ).map((m) => ({ ...m, created_at: Number(m.created_at ?? 0) })) as Message[];
  const unread = list.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-honey">
            Relation client
          </p>
          <h1 className="font-display mt-1 text-3xl font-light tracking-tight">
            Messages
          </h1>
          <p className="mt-1 text-sm text-cocoa/60">
            {unread > 0 ? `${unread} non lu(s)` : "Boîte vide. Profite."} — réponds
            directement à l'e-mail indiqué.
          </p>
        </div>
        <RefreshButton />
      </header>

      {list.length === 0 ? (
        <div className="card p-10 text-center">
          <Inbox className="mx-auto h-10 w-10 text-espresso/25" />
          <p className="mt-3 font-display text-xl font-normal text-espresso">
            Rien à lire.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((m) => (
            <li
              key={m.id}
              className={`card p-6 ${m.read ? "opacity-75" : "border-honey/50"}`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-bold text-espresso">{m.name}</span>
                    <span className="text-cocoa/55">{m.email}</span>
                    {!m.read && <span className="badge-amber">Non lu</span>}
                  </p>
                  <p className="mt-0.5 text-xs font-light text-cocoa/55">
                    {SUBJECTS[m.subject] ?? m.subject} · {formatDate(m.created_at)}
                  </p>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-[15px] font-light leading-relaxed text-cocoa/85">
                {m.body}
              </p>
              <div className="mt-4 flex gap-2 border-t border-espresso/10 pt-4">
                {!m.read && (
                  <form action={markMessageReadAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" className="btn-outline text-xs">
                      Marquer comme lu
                    </button>
                  </form>
                )}
                <form action={deleteMessageAction} className="ml-auto">
                  <input type="hidden" name="id" value={m.id} />
                  <button
                    type="submit"
                    className="btn-ghost inline-flex items-center gap-1.5 px-4 py-2 text-xs text-red-600"
                  >
                    <Trash2 className="h-4 w-4" /> Supprimer
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
