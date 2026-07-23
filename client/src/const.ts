export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

function encodeState(value: string) {
  if (typeof btoa === "function") {
    return btoa(value);
  }

  return Buffer.from(value, "utf8").toString("base64");
}

export function buildLoginUrl(options?: {
  oauthPortalUrl?: string;
  appId?: string;
  redirectUri?: string;
  origin?: string;
}) {
  const oauthPortalUrl = options?.oauthPortalUrl ?? import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = options?.appId ?? import.meta.env.VITE_APP_ID;
  const redirectUri = options?.redirectUri ?? `${options?.origin ?? window.location.origin}/api/oauth/callback`;
  const state = encodeState(redirectUri);

  if (!oauthPortalUrl || !appId) {
    return `${options?.origin ?? window.location.origin}/`;
  }

  try {
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch {
    return `${options?.origin ?? window.location.origin}/`;
  }
}

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => buildLoginUrl();
