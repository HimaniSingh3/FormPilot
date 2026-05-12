import { DEFAULT_PROJECT } from "../data/templates.js";
import { loadProject, loadSubmissions, loadTheme } from "../services/storage.js";
import { normalizeProject } from "../services/projectIO.js";

export const state = {
  project: normalizeProject(loadProject(DEFAULT_PROJECT)),
  selectedFieldId: null,
  activePanel: "builder",
  activeExportTab: "html",
  exportFiles: null,
  validationErrors: {},
  previewValues: {},
  previewMessage: "",
  submissions: loadSubmissions(),
  theme: loadTheme(),
  fieldSearch: "",
  navOpen: false
};

export function getSelectedField() {
  return state.project.fields.find((field) => field.id === state.selectedFieldId);
}

export function selectFirstField() {
  state.selectedFieldId = state.project.fields[0]?.id || null;
}
