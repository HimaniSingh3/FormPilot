import { APP_META, EXPORT_TABS, PANELS } from "./config/constants.js";
import { FIELD_TYPES, getFieldType } from "./data/fieldTypes.js";
import { DEFAULT_PROJECT, FORM_TEMPLATES } from "./data/templates.js";
import { getSelectedField, selectFirstField, state } from "./core/state.js";
import { qs } from "./core/dom.js";
import { generateExportFiles } from "./services/exporter.js";
import { parseProjectJson, serializeProject } from "./services/projectIO.js";
import {
  resetProjectStorage,
  saveProject,
  saveSubmissions,
  saveTheme
} from "./services/storage.js";
import { validateProject, validateSubmission } from "./services/validation.js";
import { downloadTextFile, createExportFileName } from "./utils/download.js";
import { escapeAttr, escapeHtml } from "./utils/escape.js";
import { createId } from "./utils/id.js";

import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/forms.css";
import "./styles/themes.css";
import "./styles/responsive.css";

const app = qs("#app");

function init() {
  selectFirstField();
  document.documentElement.dataset.theme = state.theme;
  bindEvents();
  render();
}

function bindEvents() {
  app.addEventListener("click", handleClick);
  app.addEventListener("submit", handleSubmit);
  app.addEventListener("input", handleInput);
  app.addEventListener("change", handleChange);
}

function render() {
  app.innerHTML = `
    ${Header()}
    <main>
      ${Hero()}
      ${Workspace()}
    </main>
    ${Footer()}
    <div class="toast" data-toast></div>
  `;
}

function Header() {
  return `
    <header class="site-header">
      <nav class="nav shell">
        <a class="brand" href="#top" aria-label="FormPilot home">
          <img src="/logo.svg" alt="" class="brand-logo" />
          <span>
            <strong>${APP_META.name}</strong>
            <small>v${APP_META.version} by ${APP_META.author}</small>
          </span>
        </a>

        <button class="nav-toggle" type="button" data-action="toggle-nav" aria-label="Toggle navigation">
          <span></span><span></span><span></span>
        </button>

        <div class="nav-links ${state.navOpen ? "open" : ""}">
          <a href="#builder">Builder</a>
          <a href="#preview">Preview</a>
          <a href="#export">Export</a>
          <button class="theme-button" type="button" data-action="toggle-theme">
            ${state.theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </nav>
    </header>
  `;
}

function Hero() {
  return `
    <section class="hero shell" id="top">
      <div class="hero-copy">
        <p class="eyebrow">JavaScript Form Builder</p>
        <h1>Design forms faster. Validate smarter. Export cleaner.</h1>
        <p>
          ${APP_META.tagline} FormPilot v2 gives you a visual builder, live preview,
          saved submissions, reusable templates, project import/export, and clean code export.
        </p>
        <div class="hero-actions">
          <a class="button button-primary" href="#builder">Open Builder</a>
          <button class="button button-soft" type="button" data-action="show-panel" data-panel="templates">Use Template</button>
        </div>
      </div>

      <aside class="hero-preview" aria-label="Project summary">
        <div class="stat-grid">
          ${StatCard(state.project.fields.length, "Fields")}
          ${StatCard(state.submissions.length, "Submissions")}
          ${StatCard(PANELS.length, "Tools")}
          ${StatCard("3", "Exports")}
        </div>
        <div class="code-window">
          <div class="window-bar"><span></span><span></span><span></span></div>
          <pre><code>const pilot = {
  project: "${escapeHtml(state.project.name)}",
  fields: ${state.project.fields.length},
  author: "Himani Singh"
};

console.log("Form ready", pilot);</code></pre>
        </div>
      </aside>
    </section>
  `;
}

function StatCard(value, label) {
  return `
    <article class="stat-card">
      <strong>${value}</strong>
      <span>${label}</span>
    </article>
  `;
}

function Workspace() {
  return `
    <section class="workspace shell" id="builder">
      <div class="workspace-header">
        <div>
          <p class="eyebrow">Workspace</p>
          <h2>${escapeHtml(state.project.name)}</h2>
          <p>${escapeHtml(state.project.description)}</p>
        </div>
        <div class="workspace-actions">
          <button class="button button-soft" type="button" data-action="save-project">Save</button>
          <button class="button button-soft" type="button" data-action="download-project">Download JSON</button>
          <label class="button button-soft file-button">
            Import JSON
            <input type="file" accept="application/json,.json" data-import-project />
          </label>
          <button class="button button-primary" type="button" data-action="generate-export">Generate Export</button>
        </div>
      </div>

      <div class="panel-tabs" role="tablist">
        ${PANELS.map(PanelButton).join("")}
        <button class="panel-tab ${state.activePanel === "templates" ? "active" : ""}" type="button" data-action="show-panel" data-panel="templates">Templates</button>
      </div>

      <div class="workspace-grid">
        ${Sidebar()}
        ${MainPanel()}
      </div>
    </section>
  `;
}

function PanelButton(panel) {
  return `
    <button class="panel-tab ${state.activePanel === panel.id ? "active" : ""}" type="button" data-action="show-panel" data-panel="${panel.id}">
      ${panel.label}
    </button>
  `;
}

function Sidebar() {
  const visibleFieldTypes = FIELD_TYPES.filter((item) => {
    const text = `${item.label} ${item.description} ${item.type}`.toLowerCase();
    return text.includes(state.fieldSearch.toLowerCase());
  });

  return `
    <aside class="sidebar">
      <section class="card compact-card">
        <div class="card-heading">
          <h3>Add Fields</h3>
          <p>Build forms with common input types.</p>
        </div>
        <input class="input" data-field-search value="${escapeAttr(state.fieldSearch)}" placeholder="Search field types" aria-label="Search field types" />
        <div class="field-type-list">
          ${visibleFieldTypes.map(FieldTypeButton).join("")}
        </div>
      </section>

      <section class="card compact-card">
        <div class="card-heading">
          <h3>Form Outline</h3>
          <p>Pick, reorder, duplicate, or remove fields.</p>
        </div>
        <div class="outline-list">
          ${state.project.fields.length ? state.project.fields.map(OutlineItem).join("") : EmptyState("No fields yet", "Add a field from the library to start.")}
        </div>
      </section>
    </aside>
  `;
}

function FieldTypeButton(fieldType) {
  return `
    <button class="field-type-button" type="button" data-action="add-field" data-type="${fieldType.type}">
      <span>${fieldType.icon}</span>
      <strong>${fieldType.label}</strong>
      <small>${fieldType.description}</small>
    </button>
  `;
}

function OutlineItem(field, index) {
  const selected = field.id === state.selectedFieldId;

  return `
    <article class="outline-item ${selected ? "selected" : ""}">
      <button class="outline-main" type="button" data-action="select-field" data-id="${field.id}">
        <span>${index + 1}</span>
        <strong>${escapeHtml(field.label)}</strong>
        <small>${field.type}${field.required ? " • required" : ""}</small>
      </button>
      <div class="outline-actions">
        <button type="button" data-action="move-field" data-id="${field.id}" data-direction="up" aria-label="Move up">Up</button>
        <button type="button" data-action="move-field" data-id="${field.id}" data-direction="down" aria-label="Move down">Down</button>
        <button type="button" data-action="duplicate-field" data-id="${field.id}" aria-label="Duplicate">Copy</button>
      </div>
    </article>
  `;
}

function MainPanel() {
  if (state.activePanel === "settings") return SettingsPanel();
  if (state.activePanel === "preview") return PreviewPanel();
  if (state.activePanel === "submissions") return SubmissionsPanel();
  if (state.activePanel === "export") return ExportPanel();
  if (state.activePanel === "templates") return TemplatesPanel();
  return BuilderPanel();
}

function BuilderPanel() {
  const field = getSelectedField();

  return `
    <section class="main-stack">
      <section class="card panel-card">
        <div class="card-heading row-heading">
          <div>
            <h3>Field Editor</h3>
            <p>Customize labels, placeholders, helper text, validation, and options.</p>
          </div>
          ${field ? `<span class="status-pill">${escapeHtml(field.type)}</span>` : ""}
        </div>
        ${field ? FieldEditor(field) : EmptyState("No field selected", "Choose a field from the outline or add a new one.")}
      </section>

      <section class="card panel-card" id="preview">
        <div class="card-heading">
          <h3>Live Preview</h3>
          <p>See the form exactly as users will experience it.</p>
        </div>
        ${PreviewForm(false)}
      </section>
    </section>
  `;
}

function FieldEditor(field) {
  const hasOptions = ["select", "radio"].includes(field.type);
  const isNumber = field.type === "number";

  return `
    <form class="editor-form" data-form="field-editor">
      <label>
        Field Label
        <input class="input" name="label" value="${escapeAttr(field.label)}" required />
      </label>

      <label>
        Placeholder
        <input class="input" name="placeholder" value="${escapeAttr(field.placeholder)}" />
      </label>

      <label>
        Help Text
        <input class="input" name="helpText" value="${escapeAttr(field.helpText)}" />
      </label>

      <div class="form-grid two">
        <label>
          Minimum Length
          <input class="input" name="minLength" type="number" min="0" value="${escapeAttr(field.minLength)}" />
        </label>
        <label>
          Maximum Length
          <input class="input" name="maxLength" type="number" min="0" value="${escapeAttr(field.maxLength)}" />
        </label>
      </div>

      ${isNumber ? `
        <div class="form-grid two">
          <label>
            Minimum Value
            <input class="input" name="min" type="number" value="${escapeAttr(field.min)}" />
          </label>
          <label>
            Maximum Value
            <input class="input" name="max" type="number" value="${escapeAttr(field.max)}" />
          </label>
        </div>
      ` : ""}

      ${hasOptions ? `
        <label>
          Options
          <textarea class="input textarea" name="options" placeholder="Option one, Option two">${escapeHtml(field.options.join(", "))}</textarea>
          <small class="help-line">Separate options with commas.</small>
        </label>
      ` : ""}

      <label class="switch-row">
        <span>
          Required field
          <small>Users must complete this field before submitting.</small>
        </span>
        <input type="checkbox" name="required" ${field.required ? "checked" : ""} />
      </label>

      <div class="form-actions">
        <button class="button button-primary" type="submit">Update Field</button>
        <button class="button button-soft" type="button" data-action="duplicate-field" data-id="${field.id}">Duplicate</button>
        <button class="button button-danger" type="button" data-action="delete-field" data-id="${field.id}">Delete</button>
      </div>
    </form>
  `;
}

function SettingsPanel() {
  const projectErrors = validateProject(state.project);

  return `
    <section class="main-stack single">
      <section class="card panel-card">
        <div class="card-heading">
          <h3>Project Settings</h3>
          <p>Control the public identity of your generated form.</p>
        </div>
        <form class="editor-form" data-form="settings">
          <label>
            Form Name
            <input class="input" name="name" value="${escapeAttr(state.project.name)}" required />
          </label>
          <label>
            Description
            <textarea class="input textarea" name="description">${escapeHtml(state.project.description)}</textarea>
          </label>
          <div class="form-grid two">
            <label>
              Accent Color
              <input class="input color-input" type="color" name="accent" value="${escapeAttr(state.project.accent)}" />
            </label>
            <label>
              Category
              <input class="input" name="category" value="${escapeAttr(state.project.category || "Custom")}" />
            </label>
          </div>
          <button class="button button-primary" type="submit">Save Settings</button>
        </form>
      </section>

      <section class="card panel-card">
        <div class="card-heading">
          <h3>Project Health</h3>
          <p>Warnings help you fix issues before export.</p>
        </div>
        ${Object.keys(projectErrors).length ? ProjectErrors(projectErrors) : `<div class="success-box">Your form is ready for preview and export.</div>`}
      </section>
    </section>
  `;
}

function ProjectErrors(errors) {
  return `
    <ul class="warning-list">
      ${Object.values(errors).map((error) => `<li>${escapeHtml(error)}</li>`).join("")}
    </ul>
  `;
}

function PreviewPanel() {
  return `
    <section class="main-stack single" id="preview">
      <section class="card panel-card">
        <div class="card-heading row-heading">
          <div>
            <h3>Interactive Preview</h3>
            <p>Submit the preview to test validation and save sample submissions.</p>
          </div>
          <button class="button button-soft" type="button" data-action="clear-preview">Clear Preview</button>
        </div>
        ${PreviewForm(true)}
      </section>
    </section>
  `;
}

function PreviewForm(interactive) {
  return `
    <form class="preview-form" data-form="preview" style="--form-accent: ${escapeAttr(state.project.accent)}" novalidate>
      <header class="preview-header">
        <p class="eyebrow">Form Preview</p>
        <h2>${escapeHtml(state.project.name)}</h2>
        <p>${escapeHtml(state.project.description)}</p>
      </header>

      <div class="preview-fields">
        ${state.project.fields.length ? state.project.fields.map((field) => PreviewField(field, interactive)).join("") : EmptyState("No fields to preview", "Add fields from the builder panel.")}
      </div>

      <button class="submit-button" type="${interactive ? "submit" : "button"}">
        ${interactive ? "Submit Preview" : "Sample Submit Button"}
      </button>
      <p class="result-message ${state.previewMessage.startsWith("Success") ? "success" : ""}">${escapeHtml(state.previewMessage)}</p>
    </form>
  `;
}

function PreviewField(field, interactive) {
  const value = state.previewValues[field.id] ?? "";
  const error = state.validationErrors[field.id] || "";
  const required = field.required ? `<span class="required">*</span>` : "";
  const disabled = interactive ? "" : " disabled";
  const helpText = field.helpText ? `<small class="help-line">${escapeHtml(field.helpText)}</small>` : "";

  if (field.type === "textarea") {
    return `
      <label class="preview-field">
        <span>${escapeHtml(field.label)} ${required}</span>
        <textarea name="${field.id}" placeholder="${escapeAttr(field.placeholder)}"${disabled}>${escapeHtml(value)}</textarea>
        ${helpText}
        <small class="error-text">${escapeHtml(error)}</small>
      </label>
    `;
  }

  if (field.type === "select") {
    return `
      <label class="preview-field">
        <span>${escapeHtml(field.label)} ${required}</span>
        <select name="${field.id}"${disabled}>
          <option value="">Select an option</option>
          ${field.options.map((option) => `<option value="${escapeAttr(option)}" ${value === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
        </select>
        ${helpText}
        <small class="error-text">${escapeHtml(error)}</small>
      </label>
    `;
  }

  if (field.type === "radio") {
    return `
      <div class="preview-field">
        <span>${escapeHtml(field.label)} ${required}</span>
        <div class="choice-list">
          ${field.options.map((option) => `
            <label class="choice">
              <input type="radio" name="${field.id}" value="${escapeAttr(option)}" ${value === option ? "checked" : ""}${disabled} />
              <span>${escapeHtml(option)}</span>
            </label>
          `).join("")}
        </div>
        ${helpText}
        <small class="error-text">${escapeHtml(error)}</small>
      </div>
    `;
  }

  if (field.type === "checkbox") {
    return `
      <div class="preview-field">
        <label class="choice full-choice">
          <input type="checkbox" name="${field.id}" ${value === true ? "checked" : ""}${disabled} />
          <span>${escapeHtml(field.label)} ${required}</span>
        </label>
        ${helpText}
        <small class="error-text">${escapeHtml(error)}</small>
      </div>
    `;
  }

  return `
    <label class="preview-field">
      <span>${escapeHtml(field.label)} ${required}</span>
      <input name="${field.id}" type="${escapeAttr(field.type)}" value="${escapeAttr(value)}" placeholder="${escapeAttr(field.placeholder)}"${disabled} />
      ${helpText}
      <small class="error-text">${escapeHtml(error)}</small>
    </label>
  `;
}

function SubmissionsPanel() {
  return `
    <section class="main-stack single">
      <section class="card panel-card">
        <div class="card-heading row-heading">
          <div>
            <h3>Saved Submissions</h3>
            <p>Preview submissions are stored locally in your browser.</p>
          </div>
          <div class="export-actions">
            <button class="button button-soft" type="button" data-action="download-submissions">Download CSV</button>
            <button class="button button-danger" type="button" data-action="clear-submissions">Clear</button>
          </div>
        </div>
        ${state.submissions.length ? SubmissionsTable() : EmptyState("No submissions yet", "Open Preview, submit the form, and saved rows will appear here.")}
      </section>
    </section>
  `;
}

function SubmissionsTable() {
  const visibleFields = state.project.fields.slice(0, 4);

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            ${visibleFields.map((field) => `<th>${escapeHtml(field.label)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${state.submissions.map((submission) => `
            <tr>
              <td>${new Date(submission.createdAt).toLocaleString()}</td>
              ${visibleFields.map((field) => `<td>${escapeHtml(formatCell(submission.values[field.id]))}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function TemplatesPanel() {
  return `
    <section class="main-stack single">
      <section class="card panel-card">
        <div class="card-heading">
          <h3>Starter Templates</h3>
          <p>Load a polished form structure and customize it for your own project.</p>
        </div>
        <div class="template-grid">
          ${FORM_TEMPLATES.map(TemplateCard).join("")}
        </div>
      </section>
    </section>
  `;
}

function TemplateCard(template) {
  return `
    <article class="template-card">
      <span class="template-category">${escapeHtml(template.category)}</span>
      <h4>${escapeHtml(template.name)}</h4>
      <p>${escapeHtml(template.description)}</p>
      <div class="template-meta">
        <span>${template.fields.length} fields</span>
        <span style="--dot-color: ${escapeAttr(template.accent)}"></span>
      </div>
      <button class="button button-primary" type="button" data-action="load-template" data-template-id="${template.id}">Use Template</button>
    </article>
  `;
}

function ExportPanel() {
  state.exportFiles ||= generateExportFiles(state.project);
  const activeCode = state.exportFiles[state.activeExportTab];

  return `
    <section class="main-stack single" id="export">
      <section class="card panel-card">
        <div class="card-heading row-heading">
          <div>
            <h3>Code Export</h3>
            <p>Export a standalone form as HTML, CSS, and JavaScript.</p>
          </div>
          <div class="export-actions">
            <button class="button button-soft" type="button" data-action="copy-export">Copy</button>
            <button class="button button-primary" type="button" data-action="download-export">Download ${state.activeExportTab.toUpperCase()}</button>
          </div>
        </div>

        <div class="export-tabs">
          ${EXPORT_TABS.map((tab) => `<button class="export-tab ${state.activeExportTab === tab ? "active" : ""}" type="button" data-action="set-export-tab" data-tab="${tab}">${tab.toUpperCase()}</button>`).join("")}
        </div>

        <pre class="code-box"><code>${escapeHtml(activeCode)}</code></pre>
      </section>
    </section>
  `;
}

function Footer() {
  return `
    <footer class="footer shell">
      <p>${APP_META.name} v${APP_META.version} built by <strong>${APP_META.author}</strong></p>
      <a href="#top">Back to top</a>
    </footer>
  `;
}

function EmptyState(title, text) {
  return `
    <div class="empty-state">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(text)}</p>
    </div>
  `;
}

function handleClick(event) {
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;

  const { action } = actionTarget.dataset;

  if (action === "toggle-nav") {
    state.navOpen = !state.navOpen;
    render();
  }

  if (action === "toggle-theme") toggleTheme();
  if (action === "show-panel") showPanel(actionTarget.dataset.panel);
  if (action === "add-field") addField(actionTarget.dataset.type);
  if (action === "select-field") selectField(actionTarget.dataset.id);
  if (action === "delete-field") deleteField(actionTarget.dataset.id);
  if (action === "duplicate-field") duplicateField(actionTarget.dataset.id);
  if (action === "move-field") moveField(actionTarget.dataset.id, actionTarget.dataset.direction);
  if (action === "save-project") saveCurrentProject();
  if (action === "download-project") downloadProject();
  if (action === "generate-export") generateExport();
  if (action === "clear-preview") clearPreview();
  if (action === "download-submissions") downloadSubmissions();
  if (action === "clear-submissions") clearSubmissions();
  if (action === "load-template") loadTemplate(actionTarget.dataset.templateId);
  if (action === "set-export-tab") setExportTab(actionTarget.dataset.tab);
  if (action === "copy-export") copyExport();
  if (action === "download-export") downloadExport();
}

function handleSubmit(event) {
  const formType = event.target.dataset.form;

  if (!formType) return;
  event.preventDefault();

  if (formType === "field-editor") updateField(event.target);
  if (formType === "settings") updateSettings(event.target);
  if (formType === "preview") submitPreview(event.target);
}

function handleInput(event) {
  if (event.target.matches("[data-field-search]")) {
    state.fieldSearch = event.target.value;
    render();
  }
}

async function handleChange(event) {
  if (event.target.matches("[data-import-project]")) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      state.project = parseProjectJson(text);
      state.submissions = [];
      state.previewValues = {};
      state.validationErrors = {};
      state.activePanel = "builder";
      state.exportFiles = null;
      selectFirstField();
      saveProject(state.project);
      saveSubmissions(state.submissions);
      render();
      showToast("Project imported");
    } catch (error) {
      showToast(error.message || "Could not import project");
    }
  }
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  saveTheme(state.theme);
  document.documentElement.dataset.theme = state.theme;
  render();
}

function showPanel(panel) {
  state.activePanel = panel;
  state.navOpen = false;
  if (panel === "export") {
    state.exportFiles ||= generateExportFiles(state.project);
  }
  render();
}

function addField(type) {
  const fieldType = getFieldType(type);
  if (!fieldType) return;

  const field = {
    id: createId("field"),
    type: fieldType.type,
    ...structuredClone(fieldType.defaults),
    min: fieldType.defaults.min ?? "",
    max: fieldType.defaults.max ?? ""
  };

  state.project.fields.push(field);
  state.selectedFieldId = field.id;
  state.activePanel = "builder";
  markDirty();
  render();
  showToast(`${fieldType.label} field added`);
}

function selectField(id) {
  state.selectedFieldId = id;
  state.activePanel = "builder";
  render();
}

function updateField(formElement) {
  const field = getSelectedField();
  if (!field) return;

  const data = new FormData(formElement);

  field.label = String(data.get("label") || "").trim() || "Untitled Field";
  field.placeholder = String(data.get("placeholder") || "").trim();
  field.helpText = String(data.get("helpText") || "").trim();
  field.minLength = cleanNumber(data.get("minLength"));
  field.maxLength = cleanNumber(data.get("maxLength"));
  field.required = data.get("required") === "on";

  if (field.type === "number") {
    field.min = cleanNumber(data.get("min"));
    field.max = cleanNumber(data.get("max"));
  }

  if (["select", "radio"].includes(field.type)) {
    field.options = String(data.get("options") || "")
      .split(",")
      .map((option) => option.trim())
      .filter(Boolean);
  }

  markDirty();
  render();
  showToast("Field updated");
}

function updateSettings(formElement) {
  const data = new FormData(formElement);

  state.project.name = String(data.get("name") || "").trim() || "Untitled Form";
  state.project.description = String(data.get("description") || "").trim();
  state.project.accent = String(data.get("accent") || "#6157ff");
  state.project.category = String(data.get("category") || "Custom").trim() || "Custom";

  markDirty();
  render();
  showToast("Settings saved");
}

function deleteField(id) {
  state.project.fields = state.project.fields.filter((field) => field.id !== id);
  if (state.selectedFieldId === id) selectFirstField();
  delete state.previewValues[id];
  delete state.validationErrors[id];
  markDirty();
  render();
  showToast("Field deleted");
}

function duplicateField(id) {
  const field = state.project.fields.find((item) => item.id === id);
  if (!field) return;

  const index = state.project.fields.findIndex((item) => item.id === id);
  const copy = {
    ...structuredClone(field),
    id: createId("field"),
    label: `${field.label} Copy`
  };

  state.project.fields.splice(index + 1, 0, copy);
  state.selectedFieldId = copy.id;
  markDirty();
  render();
  showToast("Field duplicated");
}

function moveField(id, direction) {
  const currentIndex = state.project.fields.findIndex((field) => field.id === id);
  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= state.project.fields.length) return;

  const [field] = state.project.fields.splice(currentIndex, 1);
  state.project.fields.splice(nextIndex, 0, field);
  markDirty();
  render();
}

function saveCurrentProject() {
  saveProject(state.project);
  showToast("Project saved in browser");
}

function downloadProject() {
  downloadTextFile("formpilot-project.json", serializeProject(state.project), "application/json");
  showToast("Project JSON downloaded");
}

function generateExport() {
  const errors = validateProject(state.project);

  if (Object.keys(errors).length) {
    state.activePanel = "settings";
    render();
    showToast("Fix project issues before export");
    return;
  }

  state.exportFiles = generateExportFiles(state.project);
  state.activePanel = "export";
  render();
  showToast("Export generated");
}

function clearPreview() {
  state.previewValues = {};
  state.validationErrors = {};
  state.previewMessage = "";
  render();
}

function submitPreview(formElement) {
  const values = collectFormValues(formElement);
  const result = validateSubmission(state.project, values);

  state.previewValues = values;
  state.validationErrors = result.errors;

  if (result.isValid) {
    const submission = {
      id: createId("submission"),
      createdAt: new Date().toISOString(),
      values
    };

    state.submissions = [submission, ...state.submissions].slice(0, 50);
    saveSubmissions(state.submissions);
    state.previewMessage = "Success. Preview submission saved locally.";
  } else {
    state.previewMessage = "Please fix the validation errors.";
  }

  render();
}

function collectFormValues(formElement) {
  const values = {};

  state.project.fields.forEach((field) => {
    if (field.type === "checkbox") {
      values[field.id] = Boolean(formElement.elements[field.id]?.checked);
      return;
    }

    if (field.type === "radio") {
      values[field.id] = formElement.querySelector(`input[name="${field.id}"]:checked`)?.value || "";
      return;
    }

    values[field.id] = formElement.elements[field.id]?.value || "";
  });

  return values;
}

function downloadSubmissions() {
  if (!state.submissions.length) {
    showToast("No submissions to download");
    return;
  }

  const headers = ["createdAt", ...state.project.fields.map((field) => field.label)];
  const rows = state.submissions.map((submission) => [
    submission.createdAt,
    ...state.project.fields.map((field) => formatCsvCell(submission.values[field.id]))
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  downloadTextFile("formpilot-submissions.csv", csv, "text/csv");
  showToast("Submissions CSV downloaded");
}

function clearSubmissions() {
  state.submissions = [];
  saveSubmissions(state.submissions);
  render();
  showToast("Submissions cleared");
}

function loadTemplate(templateId) {
  const template = FORM_TEMPLATES.find((item) => item.id === templateId);
  if (!template) return;

  state.project = structuredClone(template);
  state.submissions = [];
  state.previewValues = {};
  state.validationErrors = {};
  state.previewMessage = "";
  state.exportFiles = null;
  state.activePanel = "builder";
  selectFirstField();
  saveProject(state.project);
  saveSubmissions(state.submissions);
  render();
  showToast("Template loaded");
}

function setExportTab(tab) {
  state.activeExportTab = tab;
  render();
}

async function copyExport() {
  state.exportFiles ||= generateExportFiles(state.project);

  try {
    await navigator.clipboard.writeText(state.exportFiles[state.activeExportTab]);
    showToast("Code copied");
  } catch {
    showToast("Clipboard unavailable");
  }
}

function downloadExport() {
  state.exportFiles ||= generateExportFiles(state.project);

  const extension = state.activeExportTab === "js" ? "js" : state.activeExportTab;
  const fileName = state.activeExportTab === "css"
    ? "styles.css"
    : state.activeExportTab === "js"
      ? "script.js"
      : createExportFileName(state.project.name, extension);

  downloadTextFile(fileName, state.exportFiles[state.activeExportTab]);
  showToast(`${fileName} downloaded`);
}

function markDirty() {
  state.exportFiles = null;
  state.validationErrors = {};
  state.previewMessage = "";
}

function cleanNumber(value) {
  const text = String(value ?? "").trim();
  return text === "" ? "" : Number(text);
}

function formatCell(value) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return value ?? "";
}

function formatCsvCell(value) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return value ?? "";
}

function showToast(message) {
  const toast = qs("[data-toast]");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("visible");

  setTimeout(() => {
    toast.classList.remove("visible");
  }, 2200);
}

init();
