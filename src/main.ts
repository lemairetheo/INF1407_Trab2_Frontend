import {
  approveBook,
  borrowBook,
  cancelReservation,
  clearTokens,
  createBook,
  createReview,
  deleteBook,
  deleteReview,
  formatError,
  getMe,
  listBooks,
  listLoans,
  listReservations,
  requireAuth,
  reserveBook,
  returnLoan,
  updateBook,
  type Book,
  type CurrentUser,
  type Loan,
  type Reservation,
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
const pendingList = document.getElementById("pending-list") as HTMLElement;
const booksList = document.getElementById("books-list") as HTMLElement;
const myLoansEl = document.getElementById("my-loans") as HTMLElement;
const myReservationsEl = document.getElementById("my-reservations") as HTMLElement;
const allLoansEl = document.getElementById("all-loans") as HTMLElement;
const allReservationsEl = document.getElementById("all-reservations") as HTMLElement;

// --- Navigation par onglets -------------------------------------------------
const tabs = document.querySelectorAll<HTMLButtonElement>(".tab");
const panels = document.querySelectorAll<HTMLElement>(".tab-panel");

function activateTab(name: string): void {
  tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
  panels.forEach((p) => (p.hidden = p.dataset.panel !== name));
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab.dataset.tab as string));
});

// Ids des livres que l'utilisateur a deja empruntes (emprunt actif).
let activeLoanBookIds = new Set<number>();

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

  // On revele les onglets reserves a l'administrateur.
  if (me.is_staff) {
    document
      .querySelectorAll<HTMLElement>(".admin-tab")
      .forEach((t) => (t.hidden = false));
  }

  await refresh();
}

// Recharge l'ensemble des donnees (livres, emprunts, reservations).
async function refresh(): Promise<void> {
  await loadLoansAndReservations();
  await loadBooks();
}

// --- Emprunts et reservations ----------------------------------------------
async function loadLoansAndReservations(): Promise<void> {
  try {
    const [loans, reservations] = await Promise.all([
      listLoans(),
      listReservations(),
    ]);

    // Emprunts de l'utilisateur courant (pour adapter les boutons du catalogue).
    activeLoanBookIds = new Set(
      loans
        .filter((l) => l.user === me?.username && l.status === "active")
        .map((l) => l.book),
    );

    renderLoans(
      myLoansEl,
      loans.filter((l) => l.user === me?.username),
      true,
    );
    renderReservations(
      myReservationsEl,
      reservations.filter((r) => r.user === me?.username),
      true,
    );

    if (me?.is_staff) {
      renderLoans(allLoansEl, loans, false);
      renderReservations(allReservationsEl, reservations, false);
    }
  } catch (error) {
    myLoansEl.innerHTML = `<p class="message error">${escapeHtml(
      formatError(error),
    )}</p>`;
  }
}

// `own` : vrai pour les listes personnelles (boutons d'action actifs).
function renderLoans(el: HTMLElement, loans: Loan[], own: boolean): void {
  if (loans.length === 0) {
    el.innerHTML = `<p class="muted">Nenhum empréstimo.</p>`;
    return;
  }
  el.innerHTML = loans
    .map((l) => {
      const who = own ? "" : ` · ${escapeHtml(l.user)}`;
      const returned = l.status === "returned";
      const badge = returned
        ? `<span class="badge approved">Devolvido</span>`
        : `<span class="badge pending">Em andamento</span>`;
      const returnBtn =
        own && !returned
          ? `<button class="btn small" data-return="${l.id}">Devolver</button>`
          : "";
      return `<div class="review">
        <span>${escapeHtml(l.book_title)}${who} ${badge}
          <span class="muted">— vencimento ${l.due_date}</span></span>
        ${returnBtn}
      </div>`;
    })
    .join("");
}

function renderReservations(
  el: HTMLElement,
  reservations: Reservation[],
  own: boolean,
): void {
  if (reservations.length === 0) {
    el.innerHTML = `<p class="muted">Nenhuma reserva.</p>`;
    return;
  }
  el.innerHTML = reservations
    .map((r) => {
      const who = own ? "" : ` · ${escapeHtml(r.user)}`;
      const labels: Record<string, string> = {
        waiting: "Na fila",
        fulfilled: "Disponível",
        cancelled: "Cancelada",
      };
      const cancelBtn =
        own && r.status === "waiting"
          ? `<button class="btn small danger" data-cancelres="${r.id}">Cancelar</button>`
          : "";
      return `<div class="review">
        <span>${escapeHtml(r.book_title)}${who}
          <span class="badge ${
            r.status === "fulfilled" ? "approved" : "pending"
          }">${labels[r.status]}</span></span>
        ${cancelBtn}
      </div>`;
    })
    .join("");
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

  // L'admin a un onglet de moderation separe des livres approuves.
  if (me?.is_staff) {
    const pending = books.filter((b) => b.status === "pending");
    const approved = books.filter((b) => b.status === "approved");
    pendingList.innerHTML = pending.length
      ? pending.map(renderBook).join("")
      : `<p class="muted">Nada para aprovar.</p>`;
    renderCatalog(approved);
  } else {
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

  // Bouton d'emprunt / reservation (uniquement pour les livres approuves).
  let loanButton = "";
  let availability = "";
  if (!isPending) {
    availability = `<span class="muted"> · ${book.available_copies}/${book.total_copies} disponível(eis)</span>`;
    if (activeLoanBookIds.has(book.id)) {
      loanButton = `<span class="badge approved">Você tem este livro</span>`;
    } else if (book.available_copies > 0) {
      loanButton = `<button class="btn small" data-borrow="${book.id}">Emprestar</button>`;
    } else {
      loanButton = `<button class="btn small secondary" data-reserve="${book.id}">Reservar</button>`;
    }
  }

  return `
    <div class="book">
      <h3>${escapeHtml(book.title)}
        <span class="badge ${book.status}">${
          isPending ? "Pendente" : "Aprovado"
        }</span>
      </h3>
      <div class="meta">por ${escapeHtml(book.author)} ·
        sugerido por ${escapeHtml(book.created_by)}${availability}</div>
      ${book.description ? `<p>${escapeHtml(book.description)}</p>` : ""}
      <div class="actions">${loanButton}${approveButton}${editButtons}</div>
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
  document.querySelectorAll<HTMLButtonElement>("[data-borrow]").forEach((btn) => {
    btn.addEventListener("click", () => handleBorrow(Number(btn.dataset.borrow)));
  });
  document.querySelectorAll<HTMLButtonElement>("[data-reserve]").forEach((btn) => {
    btn.addEventListener("click", () => handleReserve(Number(btn.dataset.reserve)));
  });
  document.querySelectorAll<HTMLButtonElement>("[data-return]").forEach((btn) => {
    btn.addEventListener("click", () => handleReturn(Number(btn.dataset.return)));
  });
  document
    .querySelectorAll<HTMLButtonElement>("[data-cancelres]")
    .forEach((btn) => {
      btn.addEventListener("click", () =>
        handleCancelReservation(Number(btn.dataset.cancelres)),
      );
    });
  document.querySelectorAll<HTMLFormElement>(".review-form").forEach((f) => {
    f.addEventListener("submit", (e) => handleReview(e, f));
  });
}

async function handleBorrow(id: number): Promise<void> {
  try {
    await borrowBook(id);
    await refresh();
  } catch (error) {
    alert(formatError(error));
  }
}

async function handleReserve(id: number): Promise<void> {
  try {
    await reserveBook(id);
    await refresh();
  } catch (error) {
    alert(formatError(error));
  }
}

async function handleReturn(id: number): Promise<void> {
  try {
    await returnLoan(id);
    await refresh();
  } catch (error) {
    alert(formatError(error));
  }
}

async function handleCancelReservation(id: number): Promise<void> {
  try {
    await cancelReservation(id);
    await refresh();
  } catch (error) {
    alert(formatError(error));
  }
}

async function handleApprove(id: number): Promise<void> {
  try {
    await approveBook(id);
    await refresh();
  } catch (error) {
    alert(formatError(error));
  }
}

async function handleDelete(id: number): Promise<void> {
  if (!confirm("Excluir este livro?")) return;
  try {
    await deleteBook(id);
    await refresh();
  } catch (error) {
    alert(formatError(error));
  }
}

async function handleDeleteReview(id: number): Promise<void> {
  try {
    await deleteReview(id);
    await refresh();
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
    await refresh();
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
    (document.getElementById("total_copies") as HTMLInputElement).value = String(
      book.total_copies,
    );
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
    total_copies: Number(
      (document.getElementById("total_copies") as HTMLInputElement).value || "1",
    ),
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
    await refresh();
  } catch (error) {
    showMessage(formMessage, formatError(error), "error");
  }
});

void init();
