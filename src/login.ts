import { isLoggedIn, login, formatError } from "./api";
import { showMessage } from "./ui";

if (isLoggedIn()) {
  window.location.href = "dashboard.html";
}

const form = document.getElementById("login-form") as HTMLFormElement;
const message = document.getElementById("message") as HTMLElement;

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = (document.getElementById("username") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement).value;

  try {
    await login(username, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    showMessage(message, formatError(error) || "Usuário ou senha inválidos.", "error");
  }
});
