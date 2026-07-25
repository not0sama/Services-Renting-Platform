import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "hrp_access_token";
const REFRESH_TOKEN_KEY = "hrp_refresh_token";

export const authStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return Cookies.get(ACCESS_TOKEN_KEY) ?? null;
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return Cookies.get(REFRESH_TOKEN_KEY) ?? null;
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    // Access token: 15 min (in days for js-cookie)
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
      expires: 1 / 96, // 15 minutes
      sameSite: "strict",
    });
    // Refresh token: 7 days
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      expires: 7,
      sameSite: "strict",
    });
  },

  clearTokens: (): void => {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
  },

  hasTokens: (): boolean => {
    return !!Cookies.get(ACCESS_TOKEN_KEY);
  },
};
