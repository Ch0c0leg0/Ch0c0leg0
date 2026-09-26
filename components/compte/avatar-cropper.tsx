"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  DEFAULT_CROP,
  formatAvatarCrop,
  type AvatarCrop,
} from "@/lib/profile-presets";

/**
 * Recadrage avatar : glisser-déposer dans le cercle + curseur de zoom.
 * Sert aussi de test d'URL : si l'image ne charge pas, message explicite.
 */
export function AvatarCropper({
  src,
  name,
  value,
  onChange,
}: {
  src: string | null;
  name: string;
  value: AvatarCrop;
  onChange: (crop: AvatarCrop) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [src]);

  function onPointerDown(e: React.PointerEvent) {
    if (!src || broken) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, tx: value.tx, ty: value.ty };
  }
  function onPointerMove(e: React.PointerEvent) {
    const start = dragRef.current;
    const box = boxRef.current;
    if (!start || !box) return;
    const size = box.getBoundingClientRect().width || 1;
    const clamp = (n: number) => Math.min(100, Math.max(-100, n));
    onChange({
      ...value,
      tx: clamp(start.tx + ((e.clientX - start.x) / size) * 100),
      ty: clamp(start.ty + ((e.clientY - start.y) / size) * 100),
    });
  }
  function onPointerUp() {
    dragRef.current = null;
  }

  return (
    <div>
      <input type="hidden" name="avatarCrop" value={formatAvatarCrop(value)} />
      <div className="flex items-center gap-4">
        <div
          ref={boxRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="h-28 w-28 shrink-0 cursor-grab touch-none overflow-hidden rounded-full bg-cream-deep ring-1 ring-espresso/10 active:cursor-grabbing"
          title={src && !broken ? "Glisse pour recadrer" : undefined}
        >
          {src && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt=""
              draggable={false}
              referrerPolicy="no-referrer"
              onError={() => setBroken(true)}
              onDragStart={(e) => e.preventDefault()}
              className="h-full w-full object-cover"
              style={{
                transform: `translate(${value.tx}%, ${value.ty}%) scale(${value.zoom})`,
              }}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-display text-4xl text-espresso">
              {(name || "?").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <label className="label" htmlFor="custom-avatar-zoom">
            Zoom · {Math.round(value.zoom * 100)} %
          </label>
          <input
            id="custom-avatar-zoom"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={value.zoom}
            disabled={!src || broken}
            onChange={(e) => onChange({ ...value, zoom: Number(e.target.value) })}
            className="w-full accent-[#ff6b4a]"
          />
          <button
            type="button"
            onClick={() => onChange(DEFAULT_CROP)}
            className="btn-ghost mt-1 px-3 py-1.5 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Recentrer
          </button>
        </div>
      </div>
      {!src ? (
        <p className="mt-2 text-[11px] text-cocoa/50">
          Choisis un avatar ou colle une URL pour activer le recadrage (glisser + zoom).
        </p>
      ) : broken ? (
        <p className="mt-2 rounded-2xl border border-coral/30 bg-coral/10 px-3 py-2 text-[11px] font-medium text-[#b23a20]">
          Cette URL ne charge pas. Vérifie qu&apos;il s&apos;agit d&apos;une image directe en
          https (pas une page web) et sans protection anti-hotlink.
        </p>
      ) : (
        <p className="mt-2 text-[11px] text-cocoa/50">
          Glisse l&apos;image dans le cercle pour la recadrer.
        </p>
      )}
    </div>
  );
}
