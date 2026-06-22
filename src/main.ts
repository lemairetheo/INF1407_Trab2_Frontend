import {
  approveBook,
  clearTokens,
  createBook,
  createReview,
  deleteBook,
  deleteReview,
  formatError,
  getMe,
  listBooks,
  requireAuth,
  updateBook,
  type Book,
  type CurrentUser,
} from "./api";
import { escapeHtml, showMessage } from "./ui";

requireAuth();

let me: CurrentUser | null = null;

// --- Elements ---------------------------------------------------------------
const userInfo = document.getElementById("user-info") as HTMLElement;
const logoutBtn = document.getElementById("logout") as HTMLButtonElement;
const form = document.getElementById("book-form") as HTMLFormElement;
const formTitle = document.getElementById("form-title") as HTMLElement;
const formHint = document.getElementById("form-hint") as HTMLElement;
const formMessage = document.getElementById("form-message") as HTMLElement;
const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const cancelEdit = document.getElementById("cancel-edit") as HTMLButtonElement;
const bookIdInput = document.getElementById("book-id") as HTMLInputElement;
const pendingCard = document.getElementById("pending-card") as HTMLElement;
const pendingList = document.getElementById("pending-list") as HTMLElement;
const booksList = document.getElementById("books-list") as HTMLElement;

logoutBtn.addEventListener("click", () => {
  clearTokens();
  window.location.href = "index.html";
});

// --- Initialisation ---------------------------------------------------------
async function init(): Promise<void> {
  try {
    me = await getMe();
  } catch {
    clearTokens();
    window.location.href = "login.html";
    return;
  }

  userInfo.textContent = `${me.username}${me.is_staff ? " (admin)" : ""}`;
  if (me.is_staff) {
    formTitle.textContent = "Adicionar um livro";
    formHint.textContent = "Como admin, o livro será publicado diretamente.";
  } else {
    formHint.textContent =
      "Sua sugestão ficará pendente até a aprovação de um administrador.";
  }

  await loadBooks();
}

// --- Chargement et rendu des livres -----------------------------------------
async function loadBooks(): Promise<void> {
  let books: Book[];
  try {
    books = await listBooks();
  } catch (error) {
    booksList.innerHTML = `<p class="message error">${escapeHtml(
      formatError(error),
    )}</p>`;
    return;
  }

  // L'admin a une zone de moderation separee des livres approuves.
  if (me?.is_staff) {
    const pending = books.filter((b) => b.status === "pending");
    const approved = books.filter((b) => b.status === "approved");
    pendingCard.hidden = pending.length === 0;
    pendingList.innerHTML = pending.length
      ? pending.map(renderBook).join("")
      : "";
    renderCatalog(approved);
  } else {
    pendingCard.hidden = true;
    renderCatalog(books);
  }

  attachBookHandlers();
}

function renderCatalog(books: Book[]): void {
  if (books.length === 0) {
    booksList.innerHTML = `<p class="muted">Nenhum livro ainda.</p>`;
    return;
  }
  booksList.innerHTML = books.map(renderBook).join("");
}

function renderBook(book: Book): string {
  const canEdit = me?.is_staff || me?.username === book.created_by;
  const isPending = book.status === "pending";

  const editButtons = canEdit
    ? `<button class="btn small secondary" data-edit="${book.id}">Editar</button>
       <button class="btn small danger" data-delete="${book.id}">Excluir</button>`
    : "";

  const approveButton =
    me?.is_staff && isPending
      ? `<button class="btn small" data-approve="${book.id}">Aprovar</button>`
      : "";

  return `
    <div class="book">
      <h3>${escapeHtml(book.title)}
        <span class="badge ${book.status}">${
          isPending ? "Pendente" : "Aprovado"
        }</span>
      </h3>
      <div class="meta">por ${escapeHtml(book.author)} ·
        sugerido por ${escapeHtml(book.created_by)}</div>
      ${book.description ? `<p>${escapeHtml(book.description)}</p>` : ""}
      <div class="actions">${approveButton}${editButtons}</div>
      ${renderReviews(book)}
    </div>`;
}

function renderReviews(book: Book): string {
  const items = book.reviews
    .map((r) => {
      const canDelete = me?.is_staff || me?.username === r.author;
      const del = canDelete
        ? `<button class="btn small danger" data-delreview="${r.id}">×</button>`
        : "";
      return `<div class="review">
        <span><strong>${escapeHtml(r.author)}</strong>
          <span class="stars">${"★".repeat(r.rating)}${"☆".repeat(
            5 - r.rating,
          )}</span>
          ${escapeHtml(r.comment)}</span>
        ${del}
      </div>`;
    })
    .join("");

  // On ne propose un avis que sur les livres approuves.
  const reviewForm =
    book.status === "approved"
      ? `<form class="review-form" data-book="${book.id}">
          <select data-rating>
            <option value="5">★★★★★</option>
            <option value="4">★★★★</option>
            <option value="3">★★★</option>
            <option value="2">★★</option>
            <option value="1">★</option>
          </select>
          <input data-comment placeholder="Deixe um comentário" />
          <button class="btn small" type="submit">Avaliar</button>
        </form>`
      : "";

  return `<div class="reviews">${items || ""}${reviewForm}</div>`;
}

// --- Gestion des evenements sur les livres ----------------------------------
function attachBookHandlers(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-approve]").forEach((btn) => {
    btn.addEventListener("click", () => handleApprove(Number(btn.dataset.approve)));
  });
  document.querySelectorAll<HTMLButtonElement>("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => handleDelete(Number(btn.dataset.delete)));
  });
  document.querySelectorAll<HTMLButtonElement>("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => startEdit(Number(btn.dataset.edit)));
  });
  document
    .querySelectorAll<HTMLButtonElement>("[data-delreview]")
    .forEach((btn) => {
      btn.addEventListener("click", () =>
        handleDeleteReview(Number(btn.dataset.delreview)),
      );
    });
  document.querySelectorAll<HTMLFormElement>(".review-form").forEach((f) => {
    f.addEventListener("submit", (e) => handleReview(e, f));
  });
}

async function handleApprove(id: number): Promise<void> {
  try {
    await approveBook(id);
    await loadBooks();
  } catch (error) {
    alert(formatError(error));
  }
}

async function handleDelete(id: number): Promise<void> {
  if (!confirm("Excluir este livro?")) return;
  try {
    await deleteBook(id);
    await loadBooks();
  } catch (error) {
    alert(formatError(error));
  }
}

async function handleDeleteReview(id: number): Promise<void> {
  try {
    await deleteReview(id);
    await loadBooks();
  } catch (error) {
    alert(formatError(error));
  }
}

async function handleReview(event: Event, f: HTMLFormElement): Promise<void> {
  event.preventDefault();
  const book = Number(f.dataset.book);
  const rating = Number(
    (f.querySelector("[data-rating]") as HTMLSelectElement).value,
  );
  const comment = (f.querySelector("[data-comment]") as HTMLInputElement).value;
  try {
    await createReview(book, rating, comment);
    await loadBooks();
  } catch (error) {
    alert(formatError(error));
  }
}

// --- Formulaire de creation / edition ---------------------------------------
function startEdit(id: number): void {
  // On relit le livre depuis l'API pour pre-remplir le formulaire.
  listBooks().then((books) => {
    const book = books.find((b) => b.id === id);
    if (!book) return;
    bookIdInput.value = String(book.id);
    (document.getElementById("title") as HTMLInputElement).value = book.title;
    (document.getElementById("author") as HTMLInputElement).value = book.author;
    (document.getElementById("description") as HTMLTextAreaElement).value =
      book.description;
    formTitle.textContent = "Editar livro";
    submitBtn.textContent = "Salvar";
    cancelEdit.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function resetForm(): void {
  form.reset();
  bookIdInput.value = "";
  formTitle.textContent = me?.is_staff ? "Adicionar um livro" : "Sugerir um livro";
  submitBtn.textContent = "Enviar";
  cancelEdit.hidden = true;
}

cancelEdit.addEventListener("click", resetForm);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = {
    title: (document.getElementById("title") as HTMLInputElement).value,
    author: (document.getElementById("author") as HTMLInputElement).value,
    description: (document.getElementById("description") as HTMLTextAreaElement)
      .value,
  };
  const editingId = bookIdInput.value ? Number(bookIdInput.value) : null;

  try {
    if (editingId) {
      await updateBook(editingId, data);
      showMessage(formMessage, "Livro atualizado.", "success");
    } else {
      await createBook(data);
      showMessage(
        formMessage,
        me?.is_staff
          ? "Livro publicado."
          : "Sugestão enviada! Aguardando aprovação.",
        "success",
      );
    }
    resetForm();
    await loadBooks();
  } catch (error) {
    showMessage(formMessage, formatError(error), "error");
  }
});

void init();
