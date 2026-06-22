import { requestPasswordReset, formatError } from "./api";
import { showMessage } from "./ui";

const form = document.getElementById("forgot-form") as HTMLFormElement;
const message = document.getElementById("message") as HTMLElement;

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = (document.getElementById("email") as HTMLInputElement).value;

  try {
    await requestPasswordReset(email);
    showMessage(
      message,
      "Se houver uma conta com esse email, um link foi enviado.",
      "success",
    );
  } catch (error) {
    showMessage(message, formatError(error), "error");
  }
});
