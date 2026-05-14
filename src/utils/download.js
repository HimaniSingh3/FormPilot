import { toKebabCase } from "./escape.js";

export function downloadTextFile(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export function createExportFileName(projectName, extension) {
  return `${toKebabCase(projectName)}.${extension}`;
}
