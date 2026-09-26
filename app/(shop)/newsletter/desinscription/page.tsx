import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyUnsubscribe } from "@/lib/email";

export const metadata: Metadata = { title: "Désinscription" };

export default async function DesinscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const email = verifyUnsubscribe(String(token ?? ""));

  let done = false;
  if (email) {
    const { error } = await createAdminClient()
      .from("newsletter_subscribers")
      .delete()
      .eq("email", email);
    done = !error;
  }

  return (
    <div className="container-page max-w-md py-14">
      <div className="card p-8 text-center">
        {done ? (
          <>
            <CheckCircle2 className="mx-auto h-10 w-10 text-espresso" />
            <h1 className="mt-4 font-display text-2xl font-normal text-espresso">
              C'est noté.
            </h1>
            <p className="mt-2 text-sm font-light text-cocoa/70">
              <span className="font-normal">{email}</span> ne recevra plus
              notre lettre. Tu reviens quand tu veux.
            </p>
          </>
        ) : (
          <>
            <TriangleAlert className="mx-auto h-10 w-10 text-[#b23a20]" />
            <h1 className="mt-4 font-display text-2xl font-normal text-espresso">
              Lien invalide.
            </h1>
            <p className="mt-2 text-sm font-light text-cocoa/70">
              Ce lien de désinscription ne fonctionne pas. Écris-nous via la
              page Contact et on s'en occupe.
            </p>
          </>
        )}
        <Link href="/" className="btn-primary mt-6">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
