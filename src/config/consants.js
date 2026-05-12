export const APP_META = {
  name: "FormPilot",
  version: "2.0",
  author: "Himani Singh",
  tagline: "Build, validate, test, save, and export responsive forms."
};

export const STORAGE_KEYS = {
  project: "formpilot:v2:project",
  theme: "formpilot:v2:theme",
  submissions: "formpilot:v2:submissions"
};

export const PANELS = [
  { id: "builder", label: "Builder" },
  { id: "settings", label: "Settings" },
  { id: "preview", label: "Preview" },
  { id: "submissions", label: "Submissions" },
  { id: "export", label: "Export" }
];

export const EXPORT_TABS = ["html", "css", "js"];

export const THEME_OPTIONS = ["dark", "light"];
