import { register, formatError } from "./api";
import { initI18n, t } from "./i18n";
import { showMessage } from "./ui";

initI18n();

const form = document.getElementById("register-form") as HTMLFormElement;
const message = document.getElementById("message") as HTMLElement;

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = (document.getElementById("username") as HTMLInputElement).value;
  const email = (document.getElementById("email") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement).value;

  try {
    await register(username, email, password);
    showMessage(message, t("reg_success"), "success");
    setTimeout(() => (window.location.href = "login.html"), 1500);
  } catch (error) {
    showMessage(message, formatError(error), "error");
  }
});
