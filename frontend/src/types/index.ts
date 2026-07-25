export type UserRole = "customer" | "provider" | "admin";
export type LanguagePref = "en" | "ar";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  language_pref: LanguagePref;
  is_active: boolean;
  accepted_terms: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export interface MessageResponse {
  message: string;
}

// ── Auth request payloads ────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  language_pref: LanguagePref;
  accepted_terms: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  new_password: string;
}
