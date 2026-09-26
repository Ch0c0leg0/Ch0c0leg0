"use client";

import { useState } from "react";
import Image from "next/image";
import { isNextImageSafe } from "@/lib/images";

const FALLBACK = "/placeholder.svg";

/** Image produit avec repli automatique si le fichier /assets est absent. */
export function ProductImage({
  src,
  alt,
  fill,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const [current, setCurrent] = useState(src || FALLBACK);
  // URL externe non autorisée (ex. page Google collée par erreur) :
  // placeholder direct, sans faire planter next/image.
  const safe = isNextImageSafe(current) ? current : FALLBACK;
  return (
    <Image
      src={safe}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      onError={() => {
        if (current !== FALLBACK) setCurrent(FALLBACK);
      }}
      className={className}
    />
  );
}
