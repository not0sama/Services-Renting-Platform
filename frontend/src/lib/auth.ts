import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "hrp_access_token";
const REFRESH_TOKEN_KEY = "hrp_refresh_token";
const ROLE_KEY = "hrp_role";

export const authStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return Cookies.get(ACCESS_TOKEN_KEY) ?? null;
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return Cookies.get(REFRESH_TOKEN_KEY) ?? null;
  },

  getRole: (): string | null => {
    if (typeof window === "undefined") return null;
    return Cookies.get(ROLE_KEY) ?? null;
  },

  setTokens: (accessToken: string, refreshToken: string, role?: string): void => {
    // Persistent cookies set for 30 days so users stay logged in across sessions
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
      expires: 30,
      sameSite: "lax",
    });
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      expires: 30,
      sameSite: "lax",
    });
    if (role) {
      Cookies.set(ROLE_KEY, role, {
        expires: 30,
        sameSite: "lax",
      });
    }
  },

  clearTokens: (): void => {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    Cookies.remove(ROLE_KEY);
  },

  hasTokens: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!Cookies.get(ACCESS_TOKEN_KEY) || !!Cookies.get(REFRESH_TOKEN_KEY);
  },
};
