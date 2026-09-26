/** classNames conditionnels — utilitaire minimal partagé. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
