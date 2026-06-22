import { confirmPasswordReset, formatError } from "./api";
import { initI18n, t } from "./i18n";
import { showMessage } from "./ui";

initI18n();

// uid et token sont passes dans l'URL (lien recu par email).
const params = new URLSearchParams(window.location.search);
const uid = params.get("uid") ?? "";
const token = params.get("token") ?? "";

const form = document.getElementById("reset-form") as HTMLFormElement;
const message = document.getElementById("message") as HTMLElement;

if (!uid || !token) {
  showMessage(message, t("reset_link_invalid"), "error");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = (document.getElementById("password") as HTMLInputElement).value;

  try {
    await confirmPasswordReset(uid, token, password);
    showMessage(message, t("reset_done"), "success");
    setTimeout(() => (window.location.href = "login.html"), 1500);
  } catch (error) {
    showMessage(message, formatError(error), "error");
  }
});
