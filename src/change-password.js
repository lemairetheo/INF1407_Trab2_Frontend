import { changePassword, clearTokens, formatError, requireAuth } from "./api";
import { initI18n, t } from "./i18n";
import { showMessage } from "./ui";
requireAuth();
initI18n();
const form = document.getElementById("change-form");
const message = document.getElementById("message");
const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
    clearTokens();
    window.location.href = "index.html";
});
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const oldPassword = document.getElementById("old").value;
    const newPassword = document.getElementById("new").value;
    try {
        await changePassword(oldPassword, newPassword);
        showMessage(message, t("change_success"), "success");
        form.reset();
    }
    catch (error) {
        showMessage(message, formatError(error), "error");
    }
});
