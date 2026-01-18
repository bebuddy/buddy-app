export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
  );
}

export function applyInert(appRoot: HTMLElement | null) {
  if (!appRoot) {
    return () => undefined;
  }

  const previousAriaHidden = appRoot.getAttribute("aria-hidden");
  const hadInert = appRoot.hasAttribute("inert");

  appRoot.setAttribute("aria-hidden", "true");
  appRoot.setAttribute("inert", "");

  return () => {
    if (previousAriaHidden === null) {
      appRoot.removeAttribute("aria-hidden");
    } else {
      appRoot.setAttribute("aria-hidden", previousAriaHidden);
    }

    if (!hadInert) {
      appRoot.removeAttribute("inert");
    }
  };
}
