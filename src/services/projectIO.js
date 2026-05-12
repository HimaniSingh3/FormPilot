export function serializeProject(project) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: "FormPilot",
      version: "2.0",
      project
    },
    null,
    2
  );
}

export function parseProjectJson(text) {
  const data = JSON.parse(text);
  const project = data.project || data;

  if (!project || typeof project !== "object") {
    throw new Error("Invalid project file.");
  }

  if (!Array.isArray(project.fields)) {
    throw new Error("Project file does not contain form fields.");
  }

  return normalizeProject(project);
}

export function normalizeProject(project) {
  return {
    id: project.id || "imported-project",
    name: project.name || "Imported Form",
    description: project.description || "Imported with FormPilot.",
    accent: project.accent || "#6157ff",
    category: project.category || "Custom",
    fields: project.fields.map((field, index) => ({
      id: field.id || `field-imported-${index}`,
      type: field.type || "text",
      label: field.label || "Untitled Field",
      placeholder: field.placeholder || "",
      helpText: field.helpText || "",
      required: Boolean(field.required),
      minLength: field.minLength ?? "",
      maxLength: field.maxLength ?? "",
      min: field.min ?? "",
      max: field.max ?? "",
      options: Array.isArray(field.options) ? field.options : []
    }))
  };
}
