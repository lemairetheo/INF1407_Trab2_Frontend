import { clearTokens, login, formatError } from "./api";
import { showMessage } from "./ui";
// On nettoie toute session existante en arrivant sur la page de login :
// cela permet de changer de compte sans rester connecte sous l'ancien.
clearTokens();
const form = document.getElementById("login-form");
const message = document.getElementById("message");
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    try {
        await login(username, password);
        window.location.href = "dashboard.html";
    }
    catch (error) {
        showMessage(message, formatError(error) || "Usuário ou senha inválidos.", "error");
    }
});
