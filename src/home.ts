// Page d'accueil PUBLIQUE : visible sans connexion.
// Les visiteurs consultent le catalogue ; pour suggerer un livre ou avaliar,
// ils doivent se connecter (liens vers login / cadastro).

import { clearTokens, formatError, isLoggedIn, listBooks, type Book } from "./api";
import { escapeHtml } from "./ui";

const nav = document.getElementById("nav") as HTMLElement;
const cta = document.getElementById("cta") as HTMLElement;
const booksList = document.getElementById("books-list") as HTMLElement;

// La barre de navigation s'adapte a l'etat de connexion.
function renderNav(): void {
  if (isLoggedIn()) {
    nav.innerHTML = `
      <a href="dashboard.html">Meu painel</a>
      <button id="logout">Sair</button>`;
    const logout = document.getElementById("logout") as HTMLButtonElement;
    logout.addEventListener("click", () => {
      clearTokens();
      window.location.reload();
    });
    cta.hidden = true;
  } else {
    nav.innerHTML = `
      <a href="login.html">Entrar</a>
      <a href="register.html">Cadastrar</a>`;
    cta.hidden = false;
  }
}

function renderReviews(book: Book): string {
  if (book.reviews.length === 0) return "";
  const items = book.reviews
    .map(
      (r) => `<div class="review">
        <span><strong>${escapeHtml(r.author)}</strong>
          <span class="stars">${"★".repeat(r.rating)}${"☆".repeat(
            5 - r.rating,
          )}</span>
          ${escapeHtml(r.comment)}</span>
      </div>`,
    )
    .join("");
  return `<div class="reviews">${items}</div>`;
}

function renderBook(book: Book): string {
  return `
    <div class="book">
      <h3>${escapeHtml(book.title)}</h3>
      <div class="meta">por ${escapeHtml(book.author)} ·
        sugerido por ${escapeHtml(book.created_by)} ·
        ${book.available_copies}/${book.total_copies} disponível(eis)</div>
      ${book.description ? `<p>${escapeHtml(book.description)}</p>` : ""}
      ${renderReviews(book)}
    </div>`;
}

async function loadBooks(): Promise<void> {
  try {
    const books = await listBooks();
    booksList.innerHTML = books.length
      ? books.map(renderBook).join("")
      : `<p class="muted">Nenhum livro publicado ainda.</p>`;
  } catch (error) {
    booksList.innerHTML = `<p class="message error">${escapeHtml(
      formatError(error),
    )}</p>`;
  }
}

renderNav();
void loadBooks();
