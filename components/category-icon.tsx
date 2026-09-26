import {
  Armchair,
  Gamepad2,
  Headset,
  Keyboard,
  Layers,
  Monitor,
  Mouse,
  Package,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Keyboard,
  Mouse,
  Layers,
  Headset,
  Monitor,
  Armchair,
  Gamepad2,
  Package,
};

/** Icône Lucide d'une catégorie (stockée en base comme nom, ex. "Keyboard"). */
export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Gamepad2;
  return <Icon className={className ?? "h-5 w-5"} aria-hidden />;
}
