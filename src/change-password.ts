import { changePassword, clearTokens, formatError, requireAuth } from "./api";
import { initI18n, t } from "./i18n";
import { showMessage } from "./ui";

requireAuth();
initI18n();

const form = document.getElementById("change-form") as HTMLFormElement;
const message = document.getElementById("message") as HTMLElement;
const logout = document.getElementById("logout") as HTMLButtonElement;

logout.addEventListener("click", () => {
  clearTokens();
  window.location.href = "index.html";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const oldPassword = (document.getElementById("old") as HTMLInputElement).value;
  const newPassword = (document.getElementById("new") as HTMLInputElement).value;

  try {
    await changePassword(oldPassword, newPassword);
    showMessage(message, t("change_success"), "success");
    form.reset();
  } catch (error) {
    showMessage(message, formatError(error), "error");
  }
});
