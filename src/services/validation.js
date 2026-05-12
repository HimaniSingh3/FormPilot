export function validateProject(project) {
  const errors = {};

  if (!project.name?.trim()) {
    errors.name = "Form name is required.";
  }

  if (!Array.isArray(project.fields) || project.fields.length === 0) {
    errors.fields = "Add at least one field before testing or exporting.";
  }

  project.fields.forEach((field) => {
    if (!field.label?.trim()) {
      errors[field.id] = "Field label is required.";
    }

    if (["select", "radio"].includes(field.type) && field.options.length === 0) {
      errors[field.id] = "This field needs at least one option.";
    }
  });

  return errors;
}

export function validateSubmission(project, values) {
  const errors = {};

  project.fields.forEach((field) => {
    const value = values[field.id];

    if (field.required && isEmpty(field, value)) {
      errors[field.id] = `${field.label} is required.`;
      return;
    }

    if (isEmpty(field, value)) {
      return;
    }

    if (field.type === "email" && !isValidEmail(value)) {
      errors[field.id] = "Enter a valid email address.";
    }

    if (field.type === "url" && !isValidUrl(value)) {
      errors[field.id] = "Enter a valid URL.";
    }

    if (field.type === "number") {
      const numericValue = Number(value);

      if (Number.isNaN(numericValue)) {
        errors[field.id] = "Enter a valid number.";
        return;
      }

      if (field.min !== "" && numericValue < Number(field.min)) {
        errors[field.id] = `Value must be at least ${field.min}.`;
      }

      if (field.max !== "" && numericValue > Number(field.max)) {
        errors[field.id] = `Value must be at most ${field.max}.`;
      }
    }

    if (field.minLength !== "" && String(value).length < Number(field.minLength)) {
      errors[field.id] = `Minimum ${field.minLength} characters required.`;
    }

    if (field.maxLength !== "" && String(value).length > Number(field.maxLength)) {
      errors[field.id] = `Maximum ${field.maxLength} characters allowed.`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function isEmpty(field, value) {
  if (field.type === "checkbox") {
    return value !== true;
  }

  return value === undefined || value === null || String(value).trim() === "";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function isValidUrl(value) {
  try {
    const url = new URL(String(value));
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}
