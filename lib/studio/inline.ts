/* Text helpers shared by the server-side package generator and the
   client-side live preview — escape everything, then allow **bold** and
   _italic_. Keep this module client-safe (no server-only, no fs). */

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function inline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>");
}

export function paragraphs(text: string, className = "prose"): string {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `      <p class="${className}">${inline(p).replace(/\r?\n/g, " ")}</p>`)
    .join("\n");
}
