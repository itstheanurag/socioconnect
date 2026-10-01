const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface UserProfile {
  id?: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  role: string;
  avatar?: string | null;
}

export interface ApiResponse<T> {
  message: string;
  payload?: T;
  error?: string;
}

export async function getGoogleOAuthUrl(): Promise<string> {
  // redirect=true ensures the backend callback establishes HttpOnly session cookies and redirects to /dashboard
  const url = `${API_BASE_URL}/v1/oauth/google?redirect=true`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to initialize Google OAuth");
  }

  const data = (await response.json()) as ApiResponse<{ link: string }>;
  if (!data.payload?.link) {
    throw new Error("Invalid OAuth link received from server");
  }

  return data.payload.link;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ApiResponse<{ user: UserProfile }>;
    return data.payload?.user || null;
  } catch {
    return null;
  }
}

export async function logoutUser(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/logout`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}
