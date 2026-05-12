import { escapeAttr, escapeHtml } from "../utils/escape.js";

export function generateExportFiles(project) {
  return {
    html: generateHtml(project),
    css: generateCss(project),
    js: generateJs(project)
  };
}

function generateHtml(project) {
  const fields = project.fields.map(renderExportField).join("\n\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(project.name)}</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="page-shell">
      <form class="generated-form" id="generatedForm" novalidate>
        <header class="form-header">
          <p class="eyebrow">Generated with FormPilot</p>
          <h1>${escapeHtml(project.name)}</h1>
          <p>${escapeHtml(project.description)}</p>
        </header>

${indent(fields, 8)}

        <button class="submit-button" type="submit">Submit Form</button>
        <p class="form-status" id="formStatus" role="status"></p>
      </form>
    </main>

    <script src="script.js"></script>
  </body>
</html>`;
}

function generateCss(project) {
  return `:root {
  --accent: ${project.accent || "#6157ff"};
  --bg: #f6f7fb;
  --card: #ffffff;
  --text: #111827;
  --muted: #6b7280;
  --border: #e5e7eb;
  --danger: #dc2626;
  --success: #15803d;
  --shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 22%, transparent), transparent 34rem), var(--bg);
  color: var(--text);
}

button,
input,
textarea,
select {
  font: inherit;
}

.page-shell {
  width: min(100% - 32px, 760px);
  min-height: 100vh;
  display: grid;
  place-items: center;
  margin-inline: auto;
  padding: 40px 0;
}

.generated-form {
  width: 100%;
  padding: clamp(22px, 5vw, 38px);
  border: 1px solid var(--border);
  border-radius: 30px;
  background: var(--card);
  box-shadow: var(--shadow);
}

.form-header {
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 12px;
  font-size: clamp(2rem, 6vw, 3.6rem);
  line-height: 0.95;
  letter-spacing: -0.06em;
}

p {
  color: var(--muted);
  line-height: 1.7;
}

.field {
  display: grid;
  gap: 8px;
  margin-bottom: 18px;
}

label {
  font-weight: 850;
}

.help-text {
  color: var(--muted);
  font-size: 0.9rem;
}

input,
textarea,
select {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 14px 16px;
  background: #ffffff;
  color: var(--text);
  outline: none;
}

textarea {
  min-height: 130px;
  resize: vertical;
}

input:focus,
textarea:focus,
select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 16%, transparent);
}

.choice-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.choice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
}

.choice input {
  width: auto;
}

.error-text {
  min-height: 20px;
  color: var(--danger);
  font-size: 0.9rem;
}

.submit-button {
  width: 100%;
  min-height: 54px;
  border: 0;
  border-radius: 999px;
  color: #ffffff;
  background: var(--accent);
  font-weight: 950;
  cursor: pointer;
}

.form-status {
  margin: 16px 0 0;
  min-height: 24px;
  font-weight: 850;
}

.form-status.success {
  color: var(--success);
}

.form-status.error {
  color: var(--danger);
}

@media (max-width: 640px) {
  .page-shell {
    width: min(100% - 22px, 760px);
    padding: 20px 0;
  }

  .generated-form {
    border-radius: 24px;
  }
}`;
}

function generateJs(project) {
  const fields = JSON.stringify(project.fields, null, 2);

  return `const fields = ${fields};

const form = document.querySelector("#generatedForm");
const status = document.querySelector("#formStatus");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const values = collectValues(form, fields);
  const errors = validate(values, fields);

  showErrors(errors);

  if (Object.keys(errors).length === 0) {
    status.textContent = "Form submitted successfully.";
    status.className = "form-status success";
    console.log("Submitted values:", values);
    form.reset();
    return;
  }

  status.textContent = "Please fix the highlighted fields.";
  status.className = "form-status error";
});

function collectValues(formElement, formFields) {
  const values = {};

  formFields.forEach((field) => {
    const element = formElement.elements[field.id];

    if (field.type === "checkbox") {
      values[field.id] = Boolean(element?.checked);
      return;
    }

    if (field.type === "radio") {
      values[field.id] = formElement.querySelector('input[name="' + field.id + '"]:checked')?.value || "";
      return;
    }

    values[field.id] = element?.value || "";
  });

  return values;
}

function validate(values, formFields) {
  const errors = {};

  formFields.forEach((field) => {
    const value = values[field.id];

    if (field.required && isEmpty(field, value)) {
      errors[field.id] = field.label + " is required.";
      return;
    }

    if (isEmpty(field, value)) {
      return;
    }

    if (field.type === "email" && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(String(value))) {
      errors[field.id] = "Enter a valid email address.";
    }

    if (field.type === "url") {
      try {
        const url = new URL(String(value));
        if (!["http:", "https:"].includes(url.protocol)) {
          errors[field.id] = "Enter a valid URL.";
        }
      } catch {
        errors[field.id] = "Enter a valid URL.";
      }
    }

    if (field.type === "number") {
      const numberValue = Number(value);

      if (Number.isNaN(numberValue)) {
        errors[field.id] = "Enter a valid number.";
        return;
      }

      if (field.min !== "" && numberValue < Number(field.min)) {
        errors[field.id] = "Value must be at least " + field.min + ".";
      }

      if (field.max !== "" && numberValue > Number(field.max)) {
        errors[field.id] = "Value must be at most " + field.max + ".";
      }
    }

    if (field.minLength !== "" && String(value).length < Number(field.minLength)) {
      errors[field.id] = "Minimum " + field.minLength + " characters required.";
    }

    if (field.maxLength !== "" && String(value).length > Number(field.maxLength)) {
      errors[field.id] = "Maximum " + field.maxLength + " characters allowed.";
    }
  });

  return errors;
}

function isEmpty(field, value) {
  if (field.type === "checkbox") {
    return value !== true;
  }

  return value === undefined || value === null || String(value).trim() === "";
}

function showErrors(errors) {
  document.querySelectorAll("[data-error]").forEach((element) => {
    element.textContent = "";
  });

  Object.entries(errors).forEach(([fieldId, error]) => {
    const element = document.querySelector('[data-error="' + fieldId + '"]');

    if (element) {
      element.textContent = error;
    }
  });
}`;
}

function renderExportField(field) {
  const required = field.required ? " required" : "";
  const minLength = field.minLength !== "" ? ` minlength="${escapeAttr(field.minLength)}"` : "";
  const maxLength = field.maxLength !== "" ? ` maxlength="${escapeAttr(field.maxLength)}"` : "";
  const min = field.min !== "" ? ` min="${escapeAttr(field.min)}"` : "";
  const max = field.max !== "" ? ` max="${escapeAttr(field.max)}"` : "";
  const help = field.helpText ? `<small class="help-text">${escapeHtml(field.helpText)}</small>` : "";
  const error = `<small class="error-text" data-error="${field.id}"></small>`;

  if (field.type === "textarea") {
    return `<div class="field">
  <label for="${field.id}">${escapeHtml(field.label)}</label>
  <textarea id="${field.id}" name="${field.id}" placeholder="${escapeAttr(field.placeholder)}"${required}${minLength}${maxLength}></textarea>
  ${help}
  ${error}
</div>`;
  }

  if (field.type === "select") {
    const options = field.options
      .map((option) => `<option value="${escapeAttr(option)}">${escapeHtml(option)}</option>`)
      .join("\n    ");

    return `<div class="field">
  <label for="${field.id}">${escapeHtml(field.label)}</label>
  <select id="${field.id}" name="${field.id}"${required}>
    <option value="">Select an option</option>
    ${options}
  </select>
  ${help}
  ${error}
</div>`;
  }

  if (field.type === "radio") {
    const options = field.options
      .map(
        (option) => `<label class="choice">
  <input type="radio" name="${field.id}" value="${escapeAttr(option)}" />
  <span>${escapeHtml(option)}</span>
</label>`
      )
      .join("\n  ");

    return `<div class="field">
  <label>${escapeHtml(field.label)}</label>
  <div class="choice-list">
  ${options}
  </div>
  ${help}
  ${error}
</div>`;
  }

  if (field.type === "checkbox") {
    return `<div class="field">
  <label class="choice">
    <input id="${field.id}" name="${field.id}" type="checkbox"${required} />
    <span>${escapeHtml(field.label)}</span>
  </label>
  ${help}
  ${error}
</div>`;
  }

  return `<div class="field">
  <label for="${field.id}">${escapeHtml(field.label)}</label>
  <input id="${field.id}" name="${field.id}" type="${escapeAttr(field.type)}" placeholder="${escapeAttr(field.placeholder)}"${required}${minLength}${maxLength}${min}${max} />
  ${help}
  ${error}
</div>`;
}

function indent(value, spaces) {
  const padding = " ".repeat(spaces);
  return value
    .split("\n")
    .map((line) => padding + line)
    .join("\n");
}
