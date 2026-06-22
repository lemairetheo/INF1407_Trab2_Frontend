// Petites fonctions utilitaires partagees par les pages.

export function showMessage(
  el: HTMLElement,
  text: string,
  type: "error" | "success",
): void {
  el.className = `message ${type}`;
  el.textContent = text;
}

export function clearMessage(el: HTMLElement): void {
  el.className = "";
  el.textContent = "";
}

// Echappe le texte pour eviter toute injection HTML lors du rendu.
export function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
