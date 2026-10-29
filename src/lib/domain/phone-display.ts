/** Display helpers for the public contact phone popup. */

export function formatContactPhone(raw: string | null | undefined, style: "domestic" | "international"): string | null {
  if (!raw?.trim()) return null;
  const digits = raw.replace(/\D/g, "");
  let national = digits;
  if (digits.startsWith("82") && digits.length >= 10) national = `0${digits.slice(2)}`;
  else if (digits.startsWith("0")) national = digits;
  else if (digits.length === 10 || digits.length === 11) national = digits.startsWith("0") ? digits : `0${digits}`;

  if (style === "domestic") {
    if (national.length === 11) return `${national.slice(0, 3)}-${national.slice(3, 7)}-${national.slice(7)}`;
    if (national.length === 10) return `${national.slice(0, 3)}-${national.slice(3, 6)}-${national.slice(6)}`;
    return national;
  }

  const rest = national.startsWith("0") ? national.slice(1) : national;
  if (rest.length >= 9) return `+82 ${rest.slice(0, 2)} ${rest.slice(2, 6)} ${rest.slice(6)}`.trim();
  return `+82 ${rest}`;
}

export function contactTelHref(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("82")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+82${digits.slice(1)}`;
  return `tel:+${digits}`;
}
