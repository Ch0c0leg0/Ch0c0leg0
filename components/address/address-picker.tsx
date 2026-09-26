"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

type Suggestion = {
  label: string;
  line1: string;
  city: string;
  postal: string;
  country: string;
  lat: number;
  lon: number;
};

const ALLOWED = new Set(["fr", "be", "ch", "lu", "ca"]);
const COUNTRY_MAP: Record<string, string> = {
  fr: "FR",
  be: "BE",
  ch: "CH",
  lu: "LU",
  ca: "CA",
};

// Vue France par défaut (avant toute sélection).
const DEFAULT_BBOX = "-5.5,41,10,51.5";

function bboxAround(lon: number, lat: number): string {
  const d = 0.02;
  return `${lon - d},${lat - d},${lon + d},${lat + d}`;
}

function setField(id: string, value: string) {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return;
  // Ne remplit le pays que s'il fait partie des options du select.
  if (el instanceof HTMLSelectElement) {
    const ok = [...el.options].some((o) => o.value === value);
    if (!ok) return;
  }
  el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

async function searchPhoton(q: string): Promise<Suggestion[]> {
  const res = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lang=fr&limit=6`
  );
  if (!res.ok) throw new Error("photon");
  const data = await res.json();
  const features = Array.isArray(data?.features) ? data.features : [];
  const out: Suggestion[] = [];
  for (const f of features) {
    const p = (f?.properties ?? {}) as Record<string, unknown>;
    const coords = (f?.geometry?.coordinates ?? []) as unknown[];
    const lon = Number(coords[0]);
    const lat = Number(coords[1]);
    const code = String(p.countrycode ?? "").toLowerCase();
    if (!ALLOWED.has(code) || !Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    const housenumber = String(p.housenumber ?? "").trim();
    const street = String(p.street ?? "").trim();
    const name = String(p.name ?? "").trim();
    const line1 = [housenumber, street].filter(Boolean).join(" ") || name;
    if (!line1) continue;
    const city = String(p.city ?? p.locality ?? p.district ?? "").trim();
    out.push({
      label: [line1, String(p.postcode ?? ""), city].filter(Boolean).join(", "),
      line1,
      city,
      postal: String(p.postcode ?? "").trim(),
      country: COUNTRY_MAP[code] ?? "",
      lat,
      lon,
    });
  }
  return out;
}

/** Recherche d'adresse libre (Photon/OSM) + aperçu carte.
 * Remplit les champs existants : adresse ET code postal (+ ville, pays).
 * Sans clé API. Si la recherche échoue, la saisie manuelle reste possible.
 */
export function AddressPicker({
  line1Id = "line1",
  cityId = "city",
  postalId = "postal",
  countryId = "country",
}: {
  line1Id?: string;
  cityId?: string;
  postalId?: string;
  countryId?: string;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pos, setPos] = useState<{ lat: number; lon: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 3) {
      setResults([]);
      setFailed(false);
      return;
    }
    setLoading(true);
    const t = window.setTimeout(async () => {
      try {
        setResults(await searchPhoton(term));
        setFailed(false);
      } catch {
        setResults([]);
        setFailed(true);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setResults([]);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setResults([]);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function choose(s: Suggestion) {
    setField(line1Id, s.line1);
    setField(cityId, s.city);
    setField(postalId, s.postal);
    if (s.country) setField(countryId, s.country);
    setPos({ lat: s.lat, lon: s.lon });
    setQ(s.line1);
    setResults([]);
  }

  const src = pos
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${bboxAround(pos.lon, pos.lat)}&layer=mapnik&marker=${pos.lat},${pos.lon}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${DEFAULT_BBOX}&layer=mapnik`;

  return (
    <div className="sm:col-span-2">
      <div ref={boxRef} className="relative">
        <label className="label" htmlFor="address-search">
          Chercher une adresse
        </label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso/30" />
          <input
            id="address-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tape ton adresse, on remplit le reste…"
            autoComplete="off"
            className="input pl-9"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-espresso/40" />
          )}
        </div>
        {results.length > 0 && (
          <ul className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-espresso/10 bg-white shadow-lift">
            {results.map((s, i) => (
              <li key={`${s.lat}-${s.lon}-${i}`}>
                <button
                  type="button"
                  onClick={() => choose(s)}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-cream"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-coral" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-espresso">{s.line1}</span>
                    <span className="block truncate text-xs text-cocoa/60">
                      {[s.postal, s.city].filter(Boolean).join(" ")}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {failed && q.trim().length >= 3 && !loading && (
          <p className="mt-1.5 px-1 text-xs text-cocoa/55">
            Recherche indisponible — saisis ton adresse à la main, ça marche aussi.
          </p>
        )}
      </div>
      <div className="mt-3 overflow-hidden rounded-2xl border border-espresso/10">
        <iframe
          title="Aperçu de l'adresse sur la carte"
          src={src}
          loading="lazy"
          className="h-48 w-full border-0"
        />
      </div>
      <p className="mt-1 px-1 text-[11px] text-cocoa/45">
        Carte © contributeurs{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          OpenStreetMap
        </a>
      </p>
    </div>
  );
}
