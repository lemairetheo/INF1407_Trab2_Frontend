// Internationalisation (PT / FR / EN) en TypeScript vanille.
// La langue est memorisee dans localStorage. Les textes statiques utilisent
// l'attribut data-i18n ; les textes dynamiques appellent t().

export type Lang = "pt" | "fr" | "en";

const LANG_KEY = "lang";

const translations: Record<string, Record<Lang, string>> = {
  // Marque / navigation
  brand: {
    pt: "📚 Biblioteca Comunitária",
    fr: "📚 Bibliothèque communautaire",
    en: "📚 Community Library",
  },
  nav_home: { pt: "Início", fr: "Accueil", en: "Home" },
  nav_change_pw: { pt: "Trocar senha", fr: "Changer le mot de passe", en: "Change password" },
  nav_logout: { pt: "Sair", fr: "Déconnexion", en: "Log out" },
  nav_panel: { pt: "Meu painel", fr: "Mon espace", en: "My panel" },
  nav_login: { pt: "Entrar", fr: "Connexion", en: "Log in" },
  nav_register: { pt: "Cadastrar", fr: "Inscription", en: "Sign up" },
  loading: { pt: "Carregando…", fr: "Chargement…", en: "Loading…" },

  // Login
  login_title: { pt: "Entrar", fr: "Connexion", en: "Log in" },
  f_user: { pt: "Usuário", fr: "Utilisateur", en: "Username" },
  f_password: { pt: "Senha", fr: "Mot de passe", en: "Password" },
  btn_login: { pt: "Entrar", fr: "Se connecter", en: "Log in" },
  forgot_link: { pt: "Esqueci minha senha", fr: "Mot de passe oublié", en: "Forgot my password" },
  no_account: { pt: "Não tem conta?", fr: "Pas de compte ?", en: "No account?" },
  register_link: { pt: "Cadastre-se", fr: "Inscrivez-vous", en: "Sign up" },
  err_login: { pt: "Usuário ou senha inválidos.", fr: "Identifiant ou mot de passe invalide.", en: "Invalid username or password." },

  // Cadastro
  reg_title: { pt: "Criar conta", fr: "Créer un compte", en: "Create account" },
  f_email: { pt: "Email", fr: "Email", en: "Email" },
  btn_register: { pt: "Cadastrar", fr: "S'inscrire", en: "Sign up" },
  have_account: { pt: "Já tem conta?", fr: "Déjà un compte ?", en: "Already have an account?" },
  login_link: { pt: "Entrar", fr: "Se connecter", en: "Log in" },
  reg_success: { pt: "Conta criada com sucesso! Redirecionando…", fr: "Compte créé ! Redirection…", en: "Account created! Redirecting…" },

  // Esqueci a senha
  forgot_title: { pt: "Esqueci minha senha", fr: "Mot de passe oublié", en: "Forgot password" },
  forgot_desc: {
    pt: "Informe seu email. Se houver uma conta, enviaremos um link de redefinição.",
    fr: "Indiquez votre email. Si un compte existe, nous enverrons un lien de réinitialisation.",
    en: "Enter your email. If an account exists, we will send a reset link.",
  },
  btn_send_link: { pt: "Enviar link", fr: "Envoyer le lien", en: "Send link" },
  back_login: { pt: "Voltar ao login", fr: "Retour à la connexion", en: "Back to login" },
  forgot_done: {
    pt: "Se houver uma conta com esse email, um link foi enviado.",
    fr: "Si un compte existe avec cet email, un lien a été envoyé.",
    en: "If an account exists for this email, a link has been sent.",
  },

  // Redefinir senha
  reset_title: { pt: "Redefinir senha", fr: "Réinitialiser le mot de passe", en: "Reset password" },
  f_new_password: { pt: "Nova senha", fr: "Nouveau mot de passe", en: "New password" },
  btn_reset: { pt: "Redefinir", fr: "Réinitialiser", en: "Reset" },
  reset_link_invalid: { pt: "Link inválido ou incompleto.", fr: "Lien invalide ou incomplet.", en: "Invalid or incomplete link." },
  reset_done: { pt: "Senha redefinida com sucesso! Redirecionando…", fr: "Mot de passe réinitialisé ! Redirection…", en: "Password reset! Redirecting…" },

  // Trocar senha
  change_title: { pt: "Trocar senha", fr: "Changer le mot de passe", en: "Change password" },
  f_old_password: { pt: "Senha atual", fr: "Mot de passe actuel", en: "Current password" },
  btn_save: { pt: "Salvar", fr: "Enregistrer", en: "Save" },
  change_success: { pt: "Senha alterada com sucesso!", fr: "Mot de passe modifié !", en: "Password changed!" },

  // Abas do painel
  tab_catalog: { pt: "Catálogo", fr: "Catalogue", en: "Catalog" },
  tab_account: { pt: "Meus empréstimos", fr: "Mes emprunts", en: "My loans" },
  tab_moderation: { pt: "Moderação", fr: "Modération", en: "Moderation" },
  tab_admin_loans: { pt: "Empréstimos", fr: "Emprunts", en: "Loans" },
  tab_admin_reservations: { pt: "Reservas", fr: "Réservations", en: "Reservations" },

  // Formulaire de livre
  form_title_suggest: { pt: "Sugerir um livro", fr: "Suggérer un livre", en: "Suggest a book" },
  form_title_add: { pt: "Adicionar um livro", fr: "Ajouter un livre", en: "Add a book" },
  form_title_edit: { pt: "Editar livro", fr: "Modifier le livre", en: "Edit book" },
  hint_admin: { pt: "Como admin, o livro será publicado diretamente.", fr: "En tant qu'admin, le livre sera publié directement.", en: "As an admin, the book will be published directly." },
  hint_user: { pt: "Sua sugestão ficará pendente até a aprovação de um administrador.", fr: "Votre suggestion restera en attente jusqu'à l'approbation d'un administrateur.", en: "Your suggestion will stay pending until an administrator approves it." },
  f_title: { pt: "Título", fr: "Titre", en: "Title" },
  f_author: { pt: "Autor", fr: "Auteur", en: "Author" },
  f_description: { pt: "Descrição", fr: "Description", en: "Description" },
  f_copies: { pt: "Exemplares", fr: "Exemplaires", en: "Copies" },
  btn_send: { pt: "Enviar", fr: "Envoyer", en: "Send" },
  btn_cancel_edit: { pt: "Cancelar edição", fr: "Annuler la modification", en: "Cancel edit" },
  msg_book_updated: { pt: "Livro atualizado.", fr: "Livre mis à jour.", en: "Book updated." },
  msg_book_published: { pt: "Livro publicado.", fr: "Livre publié.", en: "Book published." },
  msg_suggestion_sent: { pt: "Sugestão enviada! Aguardando aprovação.", fr: "Suggestion envoyée ! En attente d'approbation.", en: "Suggestion sent! Awaiting approval." },

  // Catalogue
  catalog_title: { pt: "Catálogo", fr: "Catalogue", en: "Catalog" },
  no_books: { pt: "Nenhum livro ainda.", fr: "Aucun livre pour le moment.", en: "No books yet." },
  no_books_public: { pt: "Nenhum livro publicado ainda.", fr: "Aucun livre publié pour le moment.", en: "No books published yet." },
  nothing_to_approve: { pt: "Nada para aprovar.", fr: "Rien à approuver.", en: "Nothing to approve." },

  // Carte livre
  badge_pending: { pt: "Pendente", fr: "En attente", en: "Pending" },
  badge_approved: { pt: "Aprovado", fr: "Approuvé", en: "Approved" },
  by: { pt: "por", fr: "par", en: "by" },
  suggested_by: { pt: "sugerido por", fr: "suggéré par", en: "suggested by" },
  available: { pt: "disponível(eis)", fr: "disponible(s)", en: "available" },
  btn_borrow: { pt: "Emprestar", fr: "Emprunter", en: "Borrow" },
  btn_reserve: { pt: "Reservar", fr: "Réserver", en: "Reserve" },
  have_book: { pt: "Você tem este livro", fr: "Vous avez ce livre", en: "You have this book" },
  btn_approve: { pt: "Aprovar", fr: "Approuver", en: "Approve" },
  btn_edit: { pt: "Editar", fr: "Modifier", en: "Edit" },
  btn_delete: { pt: "Excluir", fr: "Supprimer", en: "Delete" },
  confirm_delete: { pt: "Excluir este livro?", fr: "Supprimer ce livre ?", en: "Delete this book?" },

  // Avis
  leave_comment: { pt: "Deixe um comentário", fr: "Laissez un commentaire", en: "Leave a comment" },
  btn_review: { pt: "Avaliar", fr: "Évaluer", en: "Rate" },

  // Emprunts / reservas
  my_loans_title: { pt: "Meus empréstimos", fr: "Mes emprunts", en: "My loans" },
  my_reservations_title: { pt: "Minhas reservas", fr: "Mes réservations", en: "My reservations" },
  all_loans_title: { pt: "Todos os empréstimos", fr: "Tous les emprunts", en: "All loans" },
  all_reservations_title: { pt: "Todas as reservas", fr: "Toutes les réservations", en: "All reservations" },
  no_loans: { pt: "Nenhum empréstimo.", fr: "Aucun emprunt.", en: "No loans." },
  no_reservations: { pt: "Nenhuma reserva.", fr: "Aucune réservation.", en: "No reservations." },
  loan_active: { pt: "Em andamento", fr: "En cours", en: "Active" },
  loan_returned: { pt: "Devolvido", fr: "Rendu", en: "Returned" },
  btn_return: { pt: "Devolver", fr: "Rendre", en: "Return" },
  due: { pt: "vencimento", fr: "échéance", en: "due" },
  btn_cancel: { pt: "Cancelar", fr: "Annuler", en: "Cancel" },
  res_waiting: { pt: "Na fila", fr: "En file", en: "In queue" },
  res_fulfilled: { pt: "Disponível", fr: "Disponible", en: "Available" },
  res_cancelled: { pt: "Cancelada", fr: "Annulée", en: "Cancelled" },

  // Accueil public
  welcome_title: { pt: "Bem-vindo(a) à Biblioteca Comunitária", fr: "Bienvenue à la Bibliothèque communautaire", en: "Welcome to the Community Library" },
  welcome_text: {
    pt: "Explore livremente o catálogo abaixo. Quer sugerir um livro ou deixar uma avaliação?",
    fr: "Explorez librement le catalogue ci-dessous. Envie de suggérer un livre ou de laisser un avis ?",
    en: "Browse the catalog below freely. Want to suggest a book or leave a review?",
  },
};

export function getLang(): Lang {
  const stored = localStorage.getItem(LANG_KEY) as Lang | null;
  return stored ?? "pt";
}

export function setLang(lang: Lang): void {
  localStorage.setItem(LANG_KEY, lang);
}

// Traduit une cle. Retourne la cle elle-meme si introuvable (aide au debug).
export function t(key: string): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[getLang()];
}

// Applique les traductions aux elements statiques (data-i18n / data-i18n-ph).
function applyStatic(): void {
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n as string);
  });
  document.querySelectorAll<HTMLElement>("[data-i18n-ph]").forEach((el) => {
    (el as HTMLInputElement).placeholder = t(el.dataset.i18nPh as string);
  });
}

// Cree le selecteur de langue et l'insere dans l'element #lang-mount.
function mountSelector(): void {
  const mount = document.getElementById("lang-mount");
  if (!mount) return;
  const select = document.createElement("select");
  select.className = "lang-select";
  select.setAttribute("aria-label", "Idioma");
  (["pt", "fr", "en"] as Lang[]).forEach((lang) => {
    const opt = document.createElement("option");
    opt.value = lang;
    opt.textContent = lang.toUpperCase();
    if (lang === getLang()) opt.selected = true;
    select.appendChild(opt);
  });
  select.addEventListener("change", () => {
    setLang(select.value as Lang);
    window.location.reload();
  });
  mount.appendChild(select);
}

// A appeler au chargement de chaque page.
export function initI18n(): void {
  document.documentElement.lang = getLang();
  applyStatic();
  mountSelector();
}
