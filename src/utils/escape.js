export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function escapeAttr(value = "") {
  return escapeHtml(value).replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

export function toKebabCase(value = "file") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "formpilot";
}
