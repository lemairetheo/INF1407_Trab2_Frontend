import { isLoggedIn, login, formatError } from "./api";
import { showMessage } from "./ui";
if (isLoggedIn()) {
    window.location.href = "dashboard.html";
}
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
