import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getPublicProfile } from "@/lib/queries";
import { ProfileCard } from "@/components/compte/profile-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const found = await getPublicProfile(id).catch(() => null);
  if (!found) return { title: "Profil introuvable" };
  const name = found.profile.displayName || "Membre";
  return { title: `Profil de ${name}`, description: found.profile.bio.slice(0, 160) || undefined };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const found = await getPublicProfile(id).catch(() => null);
  if (!found) notFound();

  return (
    <div className="container-page max-w-md py-10 md:py-14">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-cocoa/70 transition-colors hover:text-espresso"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la boutique
      </Link>
      <ProfileCard
        profile={found.profile}
        googleAvatarUrl=""
        isOwner={found.isOwner}
        badges={{
          emailVerified: false,
          orderCount: found.orderCount,
          reviewCount: found.reviewCount,
          memberSince: found.memberSince,
        }}
      />
      <p className="mt-4 text-center text-xs text-cocoa/50">
        Seuls le pseudo, la bio et les décorations sont visibles ici.
      </p>
    </div>
  );
}
