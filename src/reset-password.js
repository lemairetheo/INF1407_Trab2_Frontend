import { confirmPasswordReset, formatError } from "./api";
import { showMessage } from "./ui";
// uid et token sont passes dans l'URL (lien recu par email).
const params = new URLSearchParams(window.location.search);
const uid = params.get("uid") ?? "";
const token = params.get("token") ?? "";
const form = document.getElementById("reset-form");
const message = document.getElementById("message");
if (!uid || !token) {
    showMessage(message, "Link inválido ou incompleto.", "error");
}
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = document.getElementById("password").value;
    try {
        await confirmPasswordReset(uid, token, password);
        showMessage(message, "Senha redefinida com sucesso! Redirecionando…", "success");
        setTimeout(() => (window.location.href = "login.html"), 1500);
    }
    catch (error) {
        showMessage(message, formatError(error), "error");
    }
});
