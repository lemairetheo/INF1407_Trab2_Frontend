// Couche d'acces a l'API du backend Django.
// L'URL de base est configurable via la variable d'environnement VITE_API_URL.
const API_URL = import.meta.env.VITE_API_URL ??
    "http://127.0.0.1:8000/api";
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
// --- Gestion du token ------------------------------------------------------
export function getToken() {
    return localStorage.getItem(ACCESS_KEY);
}
export function setTokens(access, refresh) {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh)
        localStorage.setItem(REFRESH_KEY, refresh);
}
export function clearTokens() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
}
export function isLoggedIn() {
    return getToken() !== null;
}
// Redirige vers la page de login si l'utilisateur n'est pas authentifie.
export function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
    }
}
// --- Erreur d'API ----------------------------------------------------------
export class ApiError extends Error {
    constructor(status, data) {
        super(`Erreur API (${status})`);
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.status = status;
        this.data = data;
    }
}
// Transforme une reponse d'erreur DRF en message lisible.
export function formatError(error) {
    if (error instanceof ApiError && error.data && typeof error.data === "object") {
        const parts = [];
        for (const [key, value] of Object.entries(error.data)) {
            const msg = Array.isArray(value) ? value.join(", ") : String(value);
            parts.push(key === "detail" ? msg : `${key}: ${msg}`);
        }
        return parts.join("\n");
    }
    if (error instanceof Error)
        return error.message;
    return "Erreur inconnue";
}
// --- Requete generique -----------------------------------------------------
async function request(path, options = {}, auth = true) {
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };
    const token = getToken();
    if (auth && token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (response.status === 401) {
        // Token invalide ou expire : on deconnecte.
        clearTokens();
        if (auth)
            window.location.href = "login.html";
    }
    if (!response.ok) {
        let data = null;
        try {
            data = await response.json();
        }
        catch {
            data = response.statusText;
        }
        throw new ApiError(response.status, data);
    }
    if (response.status === 204)
        return undefined;
    return (await response.json());
}
// --- Authentification ------------------------------------------------------
export async function login(username, password) {
    const data = await request("/auth/login/", { method: "POST", body: JSON.stringify({ username, password }) }, false);
    setTokens(data.access, data.refresh);
}
export async function register(username, email, password) {
    await request("/auth/register/", { method: "POST", body: JSON.stringify({ username, email, password }) }, false);
}
export async function changePassword(oldPassword, newPassword) {
    await request("/auth/change-password/", {
        method: "POST",
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
}
export async function requestPasswordReset(email) {
    await request("/auth/password-reset/", { method: "POST", body: JSON.stringify({ email }) }, false);
}
export async function confirmPasswordReset(uid, token, newPassword) {
    await request("/auth/password-reset/confirm/", {
        method: "POST",
        body: JSON.stringify({ uid, token, new_password: newPassword }),
    }, false);
}
export function getMe() {
    return request("/auth/me/");
}
// --- Livres (CRUD) ---------------------------------------------------------
export function listBooks() {
    return request("/books/");
}
export function createBook(data) {
    return request("/books/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}
export function updateBook(id, data) {
    return request(`/books/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}
export function deleteBook(id) {
    return request(`/books/${id}/`, { method: "DELETE" });
}
export function approveBook(id) {
    return request(`/books/${id}/approve/`, { method: "POST" });
}
// --- Avis ------------------------------------------------------------------
export function createReview(book, rating, comment) {
    return request("/reviews/", {
        method: "POST",
        body: JSON.stringify({ book, rating, comment }),
    });
}
export function deleteReview(id) {
    return request(`/reviews/${id}/`, { method: "DELETE" });
}
