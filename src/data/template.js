export const FORM_TEMPLATES = [
  {
    id: "client-intake",
    name: "Client Intake Form",
    description: "Collect project requirements from potential clients.",
    accent: "#6157ff",
    category: "Business",
    fields: [
      {
        id: "field-full-name",
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name",
        helpText: "Use your official name.",
        required: true,
        minLength: 2,
        maxLength: 80,
        min: "",
        max: "",
        options: []
      },
      {
        id: "field-email",
        type: "email",
        label: "Email Address",
        placeholder: "name@example.com",
        helpText: "We will use this to contact you.",
        required: true,
        minLength: "",
        maxLength: 120,
        min: "",
        max: "",
        options: []
      },
      {
        id: "field-service",
        type: "select",
        label: "Service Needed",
        placeholder: "",
        helpText: "Choose the service that best matches your request.",
        required: true,
        minLength: "",
        maxLength: "",
        min: "",
        max: "",
        options: ["Website Design", "Frontend Development", "Brand Identity", "Consultation"]
      },
      {
        id: "field-budget",
        type: "number",
        label: "Estimated Budget",
        placeholder: "Enter your budget",
        helpText: "Optional but helpful for planning.",
        required: false,
        minLength: "",
        maxLength: "",
        min: 0,
        max: "",
        options: []
      },
      {
        id: "field-details",
        type: "textarea",
        label: "Project Details",
        placeholder: "Tell us about your project",
        helpText: "Include timeline, goals, and important features.",
        required: true,
        minLength: 20,
        maxLength: 700,
        min: "",
        max: "",
        options: []
      }
    ]
  },
  {
    id: "event-registration",
    name: "Event Registration Form",
    description: "Register attendees and collect event preferences.",
    accent: "#18c7c9",
    category: "Event",
    fields: [
      {
        id: "field-name",
        type: "text",
        label: "Attendee Name",
        placeholder: "Enter attendee name",
        helpText: "Name that should appear on the pass.",
        required: true,
        minLength: 2,
        maxLength: 80,
        min: "",
        max: "",
        options: []
      },
      {
        id: "field-email-event",
        type: "email",
        label: "Email",
        placeholder: "attendee@example.com",
        helpText: "Confirmation will be sent here.",
        required: true,
        minLength: "",
        maxLength: 120,
        min: "",
        max: "",
        options: []
      },
      {
        id: "field-ticket",
        type: "radio",
        label: "Ticket Type",
        placeholder: "",
        helpText: "Choose your ticket type.",
        required: true,
        minLength: "",
        maxLength: "",
        min: "",
        max: "",
        options: ["General", "VIP", "Student"]
      },
      {
        id: "field-date",
        type: "date",
        label: "Preferred Day",
        placeholder: "",
        helpText: "Select the day you plan to attend.",
        required: false,
        minLength: "",
        maxLength: "",
        min: "",
        max: "",
        options: []
      }
    ]
  },
  {
    id: "feedback-survey",
    name: "Feedback Survey",
    description: "Collect structured feedback from users or customers.",
    accent: "#f59e0b",
    category: "Survey",
    fields: [
      {
        id: "field-rating",
        type: "radio",
        label: "Overall Rating",
        placeholder: "",
        helpText: "How would you rate your experience?",
        required: true,
        minLength: "",
        maxLength: "",
        min: "",
        max: "",
        options: ["Excellent", "Good", "Average", "Poor"]
      },
      {
        id: "field-improve",
        type: "textarea",
        label: "What can we improve?",
        placeholder: "Share your feedback",
        helpText: "Your feedback helps improve the product.",
        required: false,
        minLength: 5,
        maxLength: 500,
        min: "",
        max: "",
        options: []
      },
      {
        id: "field-followup",
        type: "checkbox",
        label: "I am open to being contacted for follow-up questions",
        placeholder: "",
        helpText: "Optional.",
        required: false,
        minLength: "",
        maxLength: "",
        min: "",
        max: "",
        options: []
      }
    ]
  }
];

export const DEFAULT_PROJECT = FORM_TEMPLATES[0];
