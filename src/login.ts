import { clearTokens, login, formatError } from "./api";
import { initI18n, t } from "./i18n";
import { showMessage } from "./ui";

initI18n();

// On nettoie toute session existante en arrivant sur la page de login :
// cela permet de changer de compte sans rester connecte sous l'ancien.
clearTokens();

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
    showMessage(message, formatError(error) || t("err_login"), "error");
  }
});
