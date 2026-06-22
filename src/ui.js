// Petites fonctions utilitaires partagees par les pages.
export function showMessage(el, text, type) {
    el.className = `message ${type}`;
    el.textContent = text;
}
export function clearMessage(el) {
    el.className = "";
    el.textContent = "";
}
// Echappe le texte pour eviter toute injection HTML lors du rendu.
export function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}
