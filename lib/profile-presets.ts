/* Presets de personnalisation du profil (façon Discord).
   Source unique de vérité : l'éditeur, l'aperçu, le rendu et la
   validation serveur utilisent ces listes. */

export const BIO_MAX = 190;

/** E-mail du propriétaire : couronne + badge PROPRIÉTAIRE forcés au rendu. */
export const OWNER_EMAIL = "glplouf3@proton.me";
export function isOwnerEmail(email: unknown): boolean {
  return String(email ?? "").trim().toLowerCase() === OWNER_EMAIL;
}

export type Preset = { id: string; label: string };

/* ---------- Avatar : "auto" | "initial" | preset local | URL https perso ----------
   L'upload direct exigerait Supabase Storage (plan Blaze) : en attendant,
   une image déjà hébergée (https) est acceptée telle quelle. */
export const AVATARS: (Preset & { src: string | null })[] = [
  { id: "auto", label: "Auto (photo Google)", src: null },
  { id: "initial", label: "Initiale", src: null },
  { id: "/avatars/robot.svg", label: "Robot", src: "/avatars/robot.svg" },
  { id: "/avatars/ghost.svg", label: "Fantôme", src: "/avatars/ghost.svg" },
  { id: "/avatars/gamepad.svg", label: "Manette", src: "/avatars/gamepad.svg" },
  { id: "/avatars/alien.svg", label: "Alien", src: "/avatars/alien.svg" },
  { id: "/avatars/ninja.svg", label: "Ninja", src: "/avatars/ninja.svg" },
  { id: "/avatars/bolt.svg", label: "Éclair", src: "/avatars/bolt.svg" },
];
export const AVATAR_IDS = new Set(AVATARS.map((a) => a.id));

/* ---------- Décoration d'avatar (overlay SVG) ---------- */
export const DECORATIONS: Preset[] = [
  { id: "none", label: "Aucune" },
  { id: "crown", label: "Couronne" },
  { id: "halo", label: "Halo" },
  { id: "flames", label: "Flammes" },
  { id: "circuit", label: "Circuit" },
];
export const DECORATION_IDS = new Set(DECORATIONS.map((d) => d.id));

/* ---------- Cadre de carte ---------- */
export const FRAMES: (Preset & { cls: string })[] = [
  { id: "none", label: "Simple", cls: "" },
  { id: "neon", label: "Néon", cls: "ring-2 ring-coral shadow-[0_0_36px_-8px_#ff6b4a]" },
  { id: "gold", label: "Or", cls: "ring-2 ring-honey shadow-[0_0_36px_-10px_#e9a13b]" },
  { id: "pixel", label: "Pixel", cls: "ring-4 ring-espresso ring-offset-2 ring-offset-cream" },
  { id: "aurora", label: "Aurore", cls: "ring-2 ring-mint shadow-[0_0_36px_-8px_#7fd1b9]" },
];
export const FRAME_IDS = new Set(FRAMES.map((f) => f.id));
export function frameClass(id: string): string {
  return FRAMES.find((f) => f.id === id)?.cls ?? "";
}

/* ---------- Bannière (fond CSS) ---------- */
export const BANNERS: (Preset & { style: string })[] = [
  { id: "sunset", label: "Sunset", style: "linear-gradient(120deg,#ff6b4a,#e9a13b)" },
  { id: "night", label: "Nuit", style: "linear-gradient(120deg,#1e130c,#4a3421)" },
  { id: "lagoon", label: "Lagune", style: "linear-gradient(120deg,#7fd1b9,#4a9a8a)" },
  { id: "grape", label: "Raisin", style: "linear-gradient(120deg,#c9b6f2,#7a5fd0)" },
  { id: "honey", label: "Miel", style: "linear-gradient(120deg,#e9a13b,#b06f1a)" },
  { id: "pistachio", label: "Pistache", style: "linear-gradient(120deg,#a8c256,#5f7a2a)" },
  { id: "mono", label: "Espresso", style: "#221610" },
  { id: "cream", label: "Crème", style: "#eee0c0" },
];
export const BANNER_IDS = new Set(BANNERS.map((b) => b.id));
export function bannerStyle(id: string): string {
  return BANNERS.find((b) => b.id === id)?.style ?? BANNERS[0].style;
}

/* ---------- Couleur d'accent ---------- */
export const ACCENTS: (Preset & { hex: string })[] = [
  { id: "coral", label: "Corail", hex: "#ff6b4a" },
  { id: "honey", label: "Miel", hex: "#e9a13b" },
  { id: "mint", label: "Menthe", hex: "#3fa98c" },
  { id: "grape", label: "Raisin", hex: "#7a5fd0" },
  { id: "sky", label: "Ciel", hex: "#3e8ef0" },
  { id: "rose", label: "Rose", hex: "#ef5da8" },
  { id: "lime", label: "Citron", hex: "#7a9a1e" },
  { id: "espresso", label: "Espresso", hex: "#4a3421" },
];
export const ACCENT_IDS = new Set(ACCENTS.map((a) => a.id));
export function accentHex(id: string): string {
  return ACCENTS.find((a) => a.id === id)?.hex ?? ACCENTS[0].hex;
}

/* ---------- Style du pseudo ---------- */
export const NAME_STYLES: (Preset & { cls: string; style?: string })[] = [
  { id: "default", label: "Classique", cls: "text-espresso" },
  { id: "neon", label: "Néon", cls: "", style: "color:#ff6b4a;text-shadow:0 0 18px #ff6b4a66" },
  { id: "gold", label: "Or", cls: "", style: "background:linear-gradient(100deg,#e9a13b,#fff3d6,#e9a13b);-webkit-background-clip:text;background-clip:text;color:transparent" },
  { id: "grape", label: "Raisin", cls: "", style: "background:linear-gradient(100deg,#7a5fd0,#c9b6f2);-webkit-background-clip:text;background-clip:text;color:transparent" },
  { id: "mint", label: "Menthe", cls: "", style: "color:#1f7a63" },
  { id: "ghost", label: "Fantôme", cls: "text-espresso/60" },
];
export const NAME_STYLE_IDS = new Set(NAME_STYLES.map((n) => n.id));

/* ---------- Plaque nominative (fond derrière le pseudo) ---------- */
export const NAMEPLATES: (Preset & { style: string })[] = [
  { id: "none", label: "Aucune", style: "transparent" },
  { id: "arcade", label: "Arcade", style: "linear-gradient(100deg,#221610,#4a3421)" },
  { id: "sunset", label: "Sunset", style: "linear-gradient(100deg,#ff6b4a,#e9a13b)" },
  { id: "lagoon", label: "Lagune", style: "linear-gradient(100deg,#1f7a63,#7fd1b9)" },
  { id: "grape", label: "Raisin", style: "linear-gradient(100deg,#4a3670,#c9b6f2)" },
  { id: "pixel", label: "Damier", style: "repeating-conic-gradient(#221610 0 25%,#fbf3e4 0 50%) 0 0/16px 16px" },
];
export const NAMEPLATE_IDS = new Set(NAMEPLATES.map((n) => n.id));
export function nameplateStyle(id: string): string {
  return NAMEPLATES.find((n) => n.id === id)?.style ?? "transparent";
}

/* ---------- Effet de carte (CSS pur) ---------- */
export const EFFECTS: Preset[] = [
  { id: "none", label: "Aucun" },
  { id: "shine", label: "Reflet" },
  { id: "float", label: "Flottement" },
  { id: "glow", label: "Halo pulsé" },
  { id: "sparkles", label: "Étincelles" },
];
export const EFFECT_IDS = new Set(EFFECTS.map((e) => e.id));

/** URL d'image perso acceptée : https courte, sans espaces ni quotes. */
export function isCustomAvatarUrl(v: unknown): boolean {
  const s = String(v ?? "").trim();
  return (
    s.startsWith("https://") &&
    s.length <= 500 &&
    !/[\s"'\\<>]/.test(s)
  );
}

/* ---------- Validation serveur ---------- */
export function sanitizeCustomization(input: {
  bio?: unknown;
  pronouns?: unknown;
  statusText?: unknown;
  avatarUrl?: unknown;
  avatarDecoration?: unknown;
  profileFrame?: unknown;
  banner?: unknown;
  accentColor?: unknown;
  nameStyle?: unknown;
  nameplate?: unknown;
  profileEffect?: unknown;
}) {
  const pick = (v: unknown, allowed: Set<string>, fallback: string) => {
    const s = String(v ?? fallback);
    return allowed.has(s) ? s : fallback;
  };
  const rawAvatar = String(input.avatarUrl ?? "auto");
  const avatarUrl = AVATAR_IDS.has(rawAvatar) || isCustomAvatarUrl(rawAvatar) ? rawAvatar : "auto";
  return {
    bio: String(input.bio ?? "").trim().slice(0, BIO_MAX),
    pronouns: String(input.pronouns ?? "").trim().slice(0, 20),
    statusText: String(input.statusText ?? "").trim().slice(0, 60),
    avatarUrl,
    avatarDecoration: pick(input.avatarDecoration, DECORATION_IDS, "none"),
    profileFrame: pick(input.profileFrame, FRAME_IDS, "none"),
    banner: pick(input.banner, BANNER_IDS, "sunset"),
    accentColor: pick(input.accentColor, ACCENT_IDS, "coral"),
    nameStyle: pick(input.nameStyle, NAME_STYLE_IDS, "default"),
    nameplate: pick(input.nameplate, NAMEPLATE_IDS, "none"),
    profileEffect: pick(input.profileEffect, EFFECT_IDS, "none"),
  };
}
