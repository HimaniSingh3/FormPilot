import { STORAGE_KEYS } from "../config/constants.js";

export function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadProject(fallback) {
  return readJson(STORAGE_KEYS.project, fallback);
}

export function saveProject(project) {
  writeJson(STORAGE_KEYS.project, project);
}

export function resetProjectStorage() {
  localStorage.removeItem(STORAGE_KEYS.project);
  localStorage.removeItem(STORAGE_KEYS.submissions);
}

export function loadTheme() {
  return localStorage.getItem(STORAGE_KEYS.theme) || "dark";
}

export function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

export function loadSubmissions() {
  return readJson(STORAGE_KEYS.submissions, []);
}

export function saveSubmissions(submissions) {
  writeJson(STORAGE_KEYS.submissions, submissions);
}
