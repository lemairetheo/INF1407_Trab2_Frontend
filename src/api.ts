// Couche d'acces a l'API du backend Django.
// L'URL de base est configurable via la variable d'environnement VITE_API_URL.

const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://127.0.0.1:8000/api";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

// --- Types renvoyes par l'API ---------------------------------------------

export interface Review {
  id: number;
  book: number;
  author: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  status: "pending" | "approved";
  created_by: string;
  created_at: string;
  reviews: Review[];
}

// --- Gestion du token ------------------------------------------------------

export function getToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function setTokens(access: string, refresh?: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function isLoggedIn(): boolean {
  return getToken() !== null;
}

// Redirige vers la page de login si l'utilisateur n'est pas authentifie.
export function requireAuth(): void {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
}

// --- Erreur d'API ----------------------------------------------------------

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, data: unknown) {
    super(`Erreur API (${status})`);
    this.status = status;
    this.data = data;
  }
}

// Transforme une reponse d'erreur DRF en message lisible.
export function formatError(error: unknown): string {
  if (error instanceof ApiError && error.data && typeof error.data === "object") {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(error.data as Record<string, unknown>)) {
      const msg = Array.isArray(value) ? value.join(", ") : String(value);
      parts.push(key === "detail" ? msg : `${key}: ${msg}`);
    }
    return parts.join("\n");
  }
  if (error instanceof Error) return error.message;
  return "Erreur inconnue";
}

// --- Requete generique -----------------------------------------------------

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  const token = getToken();
  if (auth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    // Token invalide ou expire : on deconnecte.
    clearTokens();
    if (auth) window.location.href = "login.html";
  }

  if (!response.ok) {
    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      data = response.statusText;
    }
    throw new ApiError(response.status, data);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

// --- Authentification ------------------------------------------------------

export async function login(username: string, password: string): Promise<void> {
  const data = await request<{ access: string; refresh: string }>(
    "/auth/login/",
    { method: "POST", body: JSON.stringify({ username, password }) },
    false,
  );
  setTokens(data.access, data.refresh);
}

export async function register(
  username: string,
  email: string,
  password: string,
): Promise<void> {
  await request(
    "/auth/register/",
    { method: "POST", body: JSON.stringify({ username, email, password }) },
    false,
  );
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  await request("/auth/change-password/", {
    method: "POST",
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await request(
    "/auth/password-reset/",
    { method: "POST", body: JSON.stringify({ email }) },
    false,
  );
}

export async function confirmPasswordReset(
  uid: string,
  token: string,
  newPassword: string,
): Promise<void> {
  await request(
    "/auth/password-reset/confirm/",
    {
      method: "POST",
      body: JSON.stringify({ uid, token, new_password: newPassword }),
    },
    false,
  );
}

export interface CurrentUser {
  username: string;
  email: string;
  is_staff: boolean;
}

export function getMe(): Promise<CurrentUser> {
  return request<CurrentUser>("/auth/me/");
}

// --- Livres (CRUD) ---------------------------------------------------------

export function listBooks(): Promise<Book[]> {
  return request<Book[]>("/books/");
}

export function createBook(
  data: Pick<Book, "title" | "author" | "description">,
): Promise<Book> {
  return request<Book>("/books/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateBook(
  id: number,
  data: Pick<Book, "title" | "author" | "description">,
): Promise<Book> {
  return request<Book>(`/books/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteBook(id: number): Promise<void> {
  return request<void>(`/books/${id}/`, { method: "DELETE" });
}

export function approveBook(id: number): Promise<Book> {
  return request<Book>(`/books/${id}/approve/`, { method: "POST" });
}

// --- Avis ------------------------------------------------------------------

export function createReview(
  book: number,
  rating: number,
  comment: string,
): Promise<Review> {
  return request<Review>("/reviews/", {
    method: "POST",
    body: JSON.stringify({ book, rating, comment }),
  });
}

export function deleteReview(id: number): Promise<void> {
  return request<void>(`/reviews/${id}/`, { method: "DELETE" });
}
