"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Avatar avec repli : si l'image ne charge pas (lien mort, anti-hotlink…),
 * affiche l'initiale au lieu de l'icône d'image cassée du navigateur.
 */
export function AvatarImg({
  src,
  name,
  className,
  imgStyle,
}: {
  src: string | null;
  name: string;
  className?: string;
  /** Style appliqué à l'img (ex. transform de recadrage). */
  imgStyle?: React.CSSProperties;
}) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <span
        className={cn(
          "flex items-center justify-center bg-cream-deep font-display text-espresso",
          className
        )}
      >
        {(name || "?").charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
      style={imgStyle}
      className={cn("bg-cream-deep object-cover", className)}
    />
  );
}
