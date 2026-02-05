import mixpanel from "mixpanel-browser";

const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ?? "";

let initialized = false;

export function initMixpanel() {
  if (typeof window === "undefined") return;
  if (initialized) return;
  if (!TOKEN) {
    console.warn("[Mixpanel] NEXT_PUBLIC_MIXPANEL_TOKEN is not set");
    return;
  }

  mixpanel.init(TOKEN, {
    track_pageview: false,
    persistence: "localStorage",
    debug: process.env.NODE_ENV === "development",
  });
  initialized = true;
}

/** init이 안 됐으면 자동으로 init 후 실행 */
function ensureInit(): boolean {
  if (typeof window === "undefined") return false;
  if (!initialized) initMixpanel();
  return initialized;
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (!ensureInit()) return;
  mixpanel.track(event, properties);
}

export function identify(userId: string) {
  if (!ensureInit()) return;
  mixpanel.identify(userId);
}

export function setUserProperties(props: Record<string, unknown>) {
  if (!ensureInit()) return;
  mixpanel.people.set(props);
}

export function reset() {
  if (!ensureInit()) return;
  mixpanel.reset();
}
