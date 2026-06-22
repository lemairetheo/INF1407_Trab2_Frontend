import { register, formatError } from "./api";
import { showMessage } from "./ui";

const form = document.getElementById("register-form") as HTMLFormElement;
const message = document.getElementById("message") as HTMLElement;

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = (document.getElementById("username") as HTMLInputElement).value;
  const email = (document.getElementById("email") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement).value;

  try {
    await register(username, email, password);
    showMessage(
      message,
      "Conta criada com sucesso! Redirecionando para o login…",
      "success",
    );
    setTimeout(() => (window.location.href = "login.html"), 1500);
  } catch (error) {
    showMessage(message, formatError(error), "error");
  }
});
