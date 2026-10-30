/** Scroll the nearest form alert or the first invalid field into view. */
export function scrollFormAlert(form: HTMLFormElement, errors?: Record<string, string>) {
  const firstKey = errors ? Object.keys(errors)[0] : undefined;
  if (firstKey) {
    const field = form.querySelector(`[name="${CSS.escape(firstKey)}"]`);
    if (field instanceof HTMLElement) {
      field.scrollIntoView({ behavior: "smooth", block: "center" });
      if ("focus" in field && typeof field.focus === "function") field.focus({ preventScroll: true });
      return;
    }
  }
  const alert = form.querySelector('[role="alert"]');
  if (alert instanceof HTMLElement) {
    alert.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
