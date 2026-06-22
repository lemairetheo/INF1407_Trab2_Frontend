import { requestPasswordReset, formatError } from "./api";
import { initI18n, t } from "./i18n";
import { showMessage } from "./ui";
initI18n();
const form = document.getElementById("forgot-form");
const message = document.getElementById("message");
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    try {
        await requestPasswordReset(email);
        showMessage(message, t("forgot_done"), "success");
    }
    catch (error) {
        showMessage(message, formatError(error), "error");
    }
});
