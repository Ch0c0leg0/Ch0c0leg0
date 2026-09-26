import { BadgeCheck, CalendarDays, ShoppingBag, Star } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";
import {
  accentHex,
  bannerStyle,
  frameClass,
  nameplateStyle,
  NAME_STYLES,
} from "@/lib/profile-presets";
import { cn } from "@/lib/cn";

export type ProfileBadges = {
  emailVerified: boolean;
  orderCount: number;
  reviewCount: number;
  memberSince: string;
};

/** Résout la source de l'avatar (preset local, photo Google ou initiale). */
export function resolveAvatarSrc(
  avatarUrl: string,
  googleAvatarUrl: string
): string | null {
  if (avatarUrl === "initial") return null;
  if (avatarUrl.startsWith("/avatars/")) return avatarUrl;
  return googleAvatarUrl || null;
}

function nameStyleProps(id: string): { cls: string; style?: React.CSSProperties } {
  const p = NAME_STYLES.find((n) => n.id === id);
  return { cls: p?.cls ?? "text-espresso", style: p?.style ? parseInline(p.style) : undefined };
}

/** Convertit "k:v;k:v" en objet style (les presets restent de simples chaînes). */
function parseInline(css: string): React.CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const key = decl.slice(0, i).trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    const val = decl.slice(i + 1).trim();
    if (key && val) out[key] = val;
  }
  return out as React.CSSProperties;
}

/** Décoration posée sur l'avatar (SVG inline, aucun asset). */
export function AvatarDecoration({ id, className }: { id: string; className?: string }) {
  if (id === "crown")
    return (
      <svg viewBox="0 0 80 44" aria-hidden className={className}>
        <path d="M6 38 12 12l14 12 14-18 14 18 14-12 6 26Z" fill="#e9a13b" stroke="#7a4d0c" strokeWidth="2" />
        <circle cx="12" cy="12" r="3.5" fill="#ff6b4a" />
        <circle cx="40" cy="6" r="3.5" fill="#ff6b4a" />
        <circle cx="68" cy="12" r="3.5" fill="#ff6b4a" />
      </svg>
    );
  if (id === "halo")
    return (
      <svg viewBox="0 0 80 24" aria-hidden className={className} fill="none">
        <ellipse cx="40" cy="13" rx="30" ry="8" stroke="#e9a13b" strokeWidth="5" />
      </svg>
    );
  if (id === "flames")
    return (
      <svg viewBox="0 0 80 80" aria-hidden className={className}>
        <path d="M40 4c4 10-6 14-2 24 3-4 5-6 5-6s-1 8 4 12c-2-8 8-10 6-20 6 4 9 10 9 18a22 22 0 1 1-44 0c0-12 16-16 22-28Z" fill="#ff6b4a" opacity="0.9" />
        <path d="M40 30c2 6-4 8-1 14 4-3 8-6 7-13-1-5-4-4-6-1Z" fill="#e9a13b" />
      </svg>
    );
  if (id === "circuit")
    return (
      <svg viewBox="0 0 80 80" aria-hidden className={className} fill="none">
        <circle cx="40" cy="40" r="37" stroke="#7fd1b9" strokeWidth="3" strokeDasharray="8 6" />
        <circle cx="40" cy="3" r="4" fill="#7fd1b9" />
        <circle cx="77" cy="40" r="4" fill="#7fd1b9" />
        <circle cx="40" cy="77" r="4" fill="#7fd1b9" />
        <circle cx="3" cy="40" r="4" fill="#7fd1b9" />
      </svg>
    );
  return null;
}

/**
 * Carte de profil façon Discord : bannière, avatar + déco,
 * pseudo stylé sur nameplate, pronoms, statut, bio, badges.
 */
export function ProfileCard({
  profile,
  googleAvatarUrl,
  badges,
  className,
}: {
  profile: Pick<
    Profile,
    | "displayName"
    | "bio"
    | "pronouns"
    | "statusText"
    | "avatarUrl"
    | "avatarDecoration"
    | "profileFrame"
    | "banner"
    | "accentColor"
    | "nameStyle"
    | "nameplate"
    | "profileEffect"
  >;
  googleAvatarUrl: string;
  badges: ProfileBadges;
  className?: string;
}) {
  const src = resolveAvatarSrc(profile.avatarUrl, googleAvatarUrl);
  const accent = accentHex(profile.accentColor);
  const name = nameStyleProps(profile.nameStyle);
  const effect =
    profile.profileEffect !== "none" ? `pfx-${profile.profileEffect}` : "";

  return (
    <div
      className={cn("card overflow-hidden", frameClass(profile.profileFrame), effect, className)}
      style={{ "--pf-accent": accent } as React.CSSProperties}
    >
      {/* Bannière */}
      <div className="relative h-24 sm:h-28" style={{ background: bannerStyle(profile.banner) }}>
        {profile.statusText && (
          <p className="absolute bottom-2 left-4 right-4 truncate text-xs font-semibold text-white drop-shadow">
            {profile.statusText}
          </p>
        )}
      </div>

      <div className="px-5 pb-5">
        {/* Avatar chevauchant */}
        <div className="relative -mt-9 mb-3 h-[4.5rem] w-[4.5rem]">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt=""
              referrerPolicy="no-referrer"
              className="h-[4.5rem] w-[4.5rem] rounded-full bg-cream-deep object-cover ring-4 ring-white"
            />
          ) : (
            <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-cream-deep font-display text-4xl text-espresso ring-4 ring-white">
              {(profile.displayName || "?").charAt(0).toUpperCase()}
            </span>
          )}
          {profile.avatarDecoration !== "none" && (
            <AvatarDecoration
              id={profile.avatarDecoration}
              className="pointer-events-none absolute -top-5 left-1/2 h-8 w-16 -translate-x-1/2"
            />
          )}
        </div>

        {/* Pseudo sur nameplate */}
        <div
          className="rounded-2xl px-3 py-2"
          style={{ background: nameplateStyle(profile.nameplate) }}
        >
          <p className={cn("font-display text-2xl font-normal leading-tight", name.cls)} style={name.style}>
            {profile.displayName || "Ton pseudo"}
          </p>
          {profile.pronouns && (
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-cocoa/60">
              {profile.pronouns}
            </p>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-cocoa/85">
            {profile.bio}
          </p>
        )}

        {/* Badges */}
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {badges.emailVerified && (
            <li className="badge-green">
              <BadgeCheck className="h-3 w-3" /> E-mail vérifié
            </li>
          )}
          {badges.orderCount > 0 && (
            <li className="badge-green">
              <ShoppingBag className="h-3 w-3" /> Acheteur · {badges.orderCount}
            </li>
          )}
          {badges.reviewCount > 0 && (
            <li className="badge-amber">
              <Star className="h-3 w-3" /> Critique · {badges.reviewCount}
            </li>
          )}
          <li className="badge-stone">
            <CalendarDays className="h-3 w-3" /> Membre depuis {badges.memberSince}
          </li>
        </ul>
      </div>
    </div>
  );
}
