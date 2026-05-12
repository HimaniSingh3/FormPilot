export const FIELD_TYPES = [
  {
    type: "text",
    label: "Text",
    description: "Single-line text input",
    icon: "T",
    defaults: {
      label: "Full Name",
      placeholder: "Enter your full name",
      helpText: "Use your official name.",
      required: true,
      minLength: 2,
      maxLength: 80,
      options: []
    }
  },
  {
    type: "email",
    label: "Email",
    description: "Email address input",
    icon: "@",
    defaults: {
      label: "Email Address",
      placeholder: "name@example.com",
      helpText: "We will never share your email.",
      required: true,
      minLength: "",
      maxLength: 120,
      options: []
    }
  },
  {
    type: "tel",
    label: "Phone",
    description: "Phone number input",
    icon: "P",
    defaults: {
      label: "Phone Number",
      placeholder: "Enter your phone number",
      helpText: "Include your country code if needed.",
      required: false,
      minLength: 7,
      maxLength: 20,
      options: []
    }
  },
  {
    type: "number",
    label: "Number",
    description: "Numeric input",
    icon: "1",
    defaults: {
      label: "Budget",
      placeholder: "Enter amount",
      helpText: "Numbers only.",
      required: false,
      minLength: "",
      maxLength: "",
      min: 0,
      max: "",
      options: []
    }
  },
  {
    type: "date",
    label: "Date",
    description: "Date picker",
    icon: "D",
    defaults: {
      label: "Preferred Date",
      placeholder: "",
      helpText: "Choose a convenient date.",
      required: false,
      minLength: "",
      maxLength: "",
      options: []
    }
  },
  {
    type: "textarea",
    label: "Textarea",
    description: "Multi-line text input",
    icon: "A",
    defaults: {
      label: "Project Details",
      placeholder: "Tell us what you want to build",
      helpText: "Share important details, goals, and requirements.",
      required: false,
      minLength: 10,
      maxLength: 500,
      options: []
    }
  },
  {
    type: "select",
    label: "Dropdown",
    description: "Select one option",
    icon: "S",
    defaults: {
      label: "Service Type",
      placeholder: "",
      helpText: "Choose one option.",
      required: true,
      minLength: "",
      maxLength: "",
      options: ["Website", "Branding", "Consultation"]
    }
  },
  {
    type: "radio",
    label: "Radio Group",
    description: "Choose one visible option",
    icon: "R",
    defaults: {
      label: "Preferred Contact Method",
      placeholder: "",
      helpText: "Select your preferred way to be contacted.",
      required: true,
      minLength: "",
      maxLength: "",
      options: ["Email", "Phone", "Message"]
    }
  },
  {
    type: "checkbox",
    label: "Checkbox",
    description: "Single confirmation checkbox",
    icon: "C",
    defaults: {
      label: "I agree to the terms and conditions",
      placeholder: "",
      helpText: "Required for submission.",
      required: true,
      minLength: "",
      maxLength: "",
      options: []
    }
  },
  {
    type: "url",
    label: "URL",
    description: "Website link input",
    icon: "U",
    defaults: {
      label: "Website URL",
      placeholder: "https://example.com",
      helpText: "Enter a valid website link.",
      required: false,
      minLength: "",
      maxLength: 200,
      options: []
    }
  }
];

export function getFieldType(type) {
  return FIELD_TYPES.find((fieldType) => fieldType.type === type);
}
