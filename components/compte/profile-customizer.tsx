"use client";

import { useState } from "react";
import { Palette, Save } from "lucide-react";
import { updateProfileCustomizationAction } from "@/app/(shop)/compte/actions";
import type { Profile } from "@/lib/supabase/types";
import {
  ACCENTS,
  AVATARS,
  BANNERS,
  BIO_MAX,
  DECORATIONS,
  EFFECTS,
  FRAMES,
  NAMEPLATES,
  NAME_STYLES,
  type Preset,
} from "@/lib/profile-presets";
import { ProfileCard, resolveAvatarSrc, type ProfileBadges } from "@/components/compte/profile-card";
import { cn } from "@/lib/cn";

type Draft = {
  displayName: string;
  bio: string;
  pronouns: string;
  statusText: string;
  avatarUrl: string;
  avatarDecoration: string;
  profileFrame: string;
  banner: string;
  accentColor: string;
  nameStyle: string;
  nameplate: string;
  profileEffect: string;
};

function Swatches<T extends Preset>({
  name,
  options,
  value,
  onPick,
  render,
}: {
  name: keyof Draft;
  options: T[];
  value: string;
  onPick: (name: keyof Draft, id: string) => void;
  render: (opt: T, selected: boolean) => React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <label
            key={opt.id}
            title={opt.label}
            className={cn(
              "cursor-pointer rounded-2xl ring-2 ring-offset-2 ring-offset-white transition-all",
              selected ? "ring-espresso" : "ring-transparent hover:ring-espresso/30"
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.id}
              checked={selected}
              onChange={() => onPick(name, opt.id)}
              className="sr-only"
            />
            {render(opt, selected)}
          </label>
        );
      })}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-cocoa/60">
      {children}
    </p>
  );
}

/** Éditeur de personnalisation + aperçu live façon Discord. */
export function ProfileCustomizer({
  profile,
  googleAvatarUrl,
  badges,
}: {
  profile: Profile | null;
  googleAvatarUrl: string;
  badges: ProfileBadges;
}) {
  const [draft, setDraft] = useState<Draft>({
    displayName: profile?.displayName ?? "",
    bio: profile?.bio ?? "",
    pronouns: profile?.pronouns ?? "",
    statusText: profile?.statusText ?? "",
    avatarUrl: profile?.avatarUrl || "auto",
    avatarDecoration: profile?.avatarDecoration || "none",
    profileFrame: profile?.profileFrame || "none",
    banner: profile?.banner || "sunset",
    accentColor: profile?.accentColor || "coral",
    nameStyle: profile?.nameStyle || "default",
    nameplate: profile?.nameplate || "none",
    profileEffect: profile?.profileEffect || "none",
  });
  const pick = (name: keyof Draft, id: string) =>
    setDraft((d) => ({ ...d, [name]: id }));
  const autoSrc = resolveAvatarSrc("auto", googleAvatarUrl);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Aperçu live */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ProfileCard profile={draft} googleAvatarUrl={googleAvatarUrl} badges={badges} />
        <p className="mt-2 text-center text-xs text-cocoa/50">
          Aperçu en direct de ta carte
        </p>
      </div>

      {/* Formulaire */}
      <form action={updateProfileCustomizationAction} className="card space-y-6 p-6">
        <h2 className="font-display flex items-center gap-2 text-lg font-normal text-espresso">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cream-deep text-espresso">
            <Palette className="h-4 w-4" />
          </span>
          Personnalisation
        </h2>

        <div>
          <label className="label" htmlFor="custom-displayName">Pseudo *</label>
          <input
            id="custom-displayName"
            name="displayName"
            required
            value={draft.displayName}
            onChange={(e) => setDraft((d) => ({ ...d, displayName: e.target.value }))}
            className="input"
          />
        </div>

        <div>
          <label className="label" htmlFor="custom-bio">
            Bio <span className="font-normal text-cocoa/50">({draft.bio.length}/{BIO_MAX})</span>
          </label>
          <textarea
            id="custom-bio"
            name="bio"
            rows={3}
            maxLength={BIO_MAX}
            value={draft.bio}
            onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
            className="input resize-y"
            placeholder="Joueur passionné, plutôt clavier 60 %…"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="custom-pronouns">Pronoms</label>
            <input
              id="custom-pronouns"
              name="pronouns"
              value={draft.pronouns}
              onChange={(e) => setDraft((d) => ({ ...d, pronouns: e.target.value }))}
              className="input"
              placeholder="il/lui"
            />
          </div>
          <div>
            <label className="label" htmlFor="custom-status">Statut</label>
            <input
              id="custom-status"
              name="statusText"
              value={draft.statusText}
              onChange={(e) => setDraft((d) => ({ ...d, statusText: e.target.value }))}
              className="input"
              placeholder="En pleine ranked…"
            />
          </div>
        </div>

        <div>
          <FieldLabel>Avatar</FieldLabel>
          <Swatches
            name="avatarUrl"
            options={AVATARS}
            value={draft.avatarUrl}
            onPick={pick}
            render={(a) => {
              const src = a.id === "auto" ? autoSrc : a.src;
              return src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={a.label} referrerPolicy="no-referrer" className="h-12 w-12 rounded-full bg-cream-deep object-cover" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-deep font-display text-xl text-espresso">
                  {(draft.displayName || "?").charAt(0).toUpperCase()}
                </span>
              );
            }}
          />
        </div>

        <div>
          <FieldLabel>Décoration d&apos;avatar</FieldLabel>
          <Swatches
            name="avatarDecoration"
            options={DECORATIONS}
            value={draft.avatarDecoration}
            onPick={pick}
            render={(d) => (
              <span className="flex h-10 min-w-16 items-center justify-center rounded-2xl bg-cream/60 px-3 text-xs font-semibold text-espresso ring-1 ring-espresso/10">
                {d.label}
              </span>
            )}
          />
        </div>

        <div>
          <FieldLabel>Cadre</FieldLabel>
          <Swatches
            name="profileFrame"
            options={FRAMES}
            value={draft.profileFrame}
            onPick={pick}
            render={(f) => (
              <span className="flex h-10 min-w-16 items-center justify-center rounded-2xl bg-cream/60 px-3 text-xs font-semibold text-espresso ring-1 ring-espresso/10">
                {f.label}
              </span>
            )}
          />
        </div>

        <div>
          <FieldLabel>Bannière</FieldLabel>
          <Swatches
            name="banner"
            options={BANNERS}
            value={draft.banner}
            onPick={pick}
            render={(b) => (
              <span className="block h-10 w-16 rounded-2xl ring-1 ring-espresso/10" style={{ background: b.style }} title={b.label} />
            )}
          />
        </div>

        <div>
          <FieldLabel>Couleur d&apos;accent</FieldLabel>
          <Swatches
            name="accentColor"
            options={ACCENTS}
            value={draft.accentColor}
            onPick={pick}
            render={(a) => (
              <span className="block h-10 w-10 rounded-full ring-1 ring-espresso/10" style={{ background: a.hex }} title={a.label} />
            )}
          />
        </div>

        <div>
          <FieldLabel>Style du pseudo</FieldLabel>
          <Swatches
            name="nameStyle"
            options={NAME_STYLES}
            value={draft.nameStyle}
            onPick={pick}
            render={(n) => (
              <span className="flex h-10 min-w-16 items-center justify-center rounded-2xl bg-cream/60 px-3 font-display text-base ring-1 ring-espresso/10">
                Aa
              </span>
            )}
          />
        </div>

        <div>
          <FieldLabel>Plaque nominative</FieldLabel>
          <Swatches
            name="nameplate"
            options={NAMEPLATES}
            value={draft.nameplate}
            onPick={pick}
            render={(n) => (
              <span className="block h-10 w-20 rounded-2xl ring-1 ring-espresso/10" style={{ background: n.style }} title={n.label} />
            )}
          />
        </div>

        <div>
          <FieldLabel>Effet de carte</FieldLabel>
          <Swatches
            name="profileEffect"
            options={EFFECTS}
            value={draft.profileEffect}
            onPick={pick}
            render={(e) => (
              <span className="flex h-10 min-w-16 items-center justify-center rounded-2xl bg-cream/60 px-3 text-xs font-semibold text-espresso ring-1 ring-espresso/10">
                {e.label}
              </span>
            )}
          />
        </div>

        <button type="submit" className="btn-coral w-full py-3">
          <Save className="h-4 w-4" /> Enregistrer ma carte
        </button>
      </form>
    </div>
  );
}
