"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

/** Saisie de note 1–5, rebond organique au survol et à la sélection. */
export function StarsInput({
  name = "rating",
  defaultValue = 5,
}: {
  name?: string;
  defaultValue?: number;
}) {
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div
      className="flex items-center gap-1.5"
      onMouseLeave={() => setHover(0)}
      role="radiogroup"
      aria-label="Ta note"
    >
      <input type="hidden" name={name} value={value} />
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} sur 5`}
          onClick={() => setValue(n)}
          onMouseEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          whileHover={{ scale: 1.35, rotate: n % 2 ? -10 : 10 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          className="rounded-full p-0.5"
        >
          <Star
            className={cn(
              "h-7 w-7 transition-colors duration-200",
              n <= shown
                ? "fill-honey text-honey"
                : "text-espresso/25"
            )}
          />
        </motion.button>
      ))}
      <span className="ml-2 text-sm font-light text-cocoa/60">
        {shown === 5 && "Parfait"}
        {shown === 4 && "Très bien"}
        {shown === 3 && "Correct"}
        {shown === 2 && "Déçu"}
        {shown === 1 && "À éviter"}
      </span>
    </div>
  );
}
